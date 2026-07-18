package com.lynxiglam.store.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * One-shot admin provisioning for environments where {@link AdminBootstrap} is
 * (correctly) inactive — i.e. production. Without it {@code admin_users} stays
 * empty forever in prod and {@code GET /analytics} is permanently unreachable,
 * because nothing else ever inserts an admin: AdminBootstrap is dev/local-only
 * and no Flyway migration seeds the table.
 *
 * <p>Gated on the {@code adminctl} profile, which the long-running service unit
 * never sets. Run it explicitly, then let it exit:
 *
 * <pre>
 * SPRING_PROFILES_ACTIVE=prod,adminctl \
 * java -Xmx256m -jar store.jar \
 *      --server.port=0 \
 *      --spring.datasource.hikari.maximum-pool-size=2
 * </pre>
 *
 * <p>Credentials come from {@code app.admin.email} plus EITHER
 * {@code app.admin.password-file} (preferred — a root-owned 0600 file) or
 * {@code app.admin.password}. Never pass the password on the command line: argv
 * is world-readable via {@code /proc/<pid>/cmdline} and every other tenant's
 * {@code ps} on this shared host would show it.
 *
 * <p>No password is ever baked into version control: there is no default value,
 * and a missing credential aborts with a non-zero exit.
 */
@Component
@Profile("adminctl")
public class AdminProvisionRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminProvisionRunner.class);

    /** Refuse to install a weak credential on a public, internet-facing admin. */
    private static final int MIN_PASSWORD_LENGTH = 16;

    private final AdminService admins;
    private final ConfigurableApplicationContext context;
    private final String email;
    private final String password;
    private final String passwordFile;
    private final String role;

    public AdminProvisionRunner(
            AdminService admins,
            ConfigurableApplicationContext context,
            @Value("${app.admin.email:}") String email,
            @Value("${app.admin.password:}") String password,
            @Value("${app.admin.password-file:}") String passwordFile,
            @Value("${app.admin.role:ADMIN}") String role
    ) {
        this.admins = admins;
        this.context = context;
        this.email = email;
        this.password = password;
        this.passwordFile = passwordFile;
        this.role = role;
    }

    @Override
    public void run(ApplicationArguments args) {
        int exitCode = 0;
        try {
            provision();
        } catch (Exception e) {
            // Message only — never the cause chain, which could echo the secret.
            log.error("Admin provisioning FAILED: {}", e.getMessage());
            exitCode = 1;
        }
        final int code = exitCode;
        System.exit(SpringApplication.exit(context, () -> code));
    }

    private void provision() throws Exception {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("app.admin.email is required (env APP_ADMIN_EMAIL).");
        }
        String raw = resolvePassword();
        if (raw.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException(
                    "Admin password must be at least " + MIN_PASSWORD_LENGTH + " characters.");
        }

        boolean created = admins.upsertAdmin(email, raw, role);
        // Log the email and the outcome. NEVER the password or the hash.
        log.info("Admin '{}' {} with role {}. Remove the credential file/env var now.",
                email, created ? "CREATED" : "PASSWORD ROTATED", role);
    }

    private String resolvePassword() throws Exception {
        if (passwordFile != null && !passwordFile.isBlank()) {
            String fromFile = Files.readString(Path.of(passwordFile)).strip();
            if (fromFile.isEmpty()) {
                throw new IllegalStateException("Password file " + passwordFile + " is empty.");
            }
            return fromFile;
        }
        if (password != null && !password.isBlank()) {
            return password;
        }
        throw new IllegalStateException(
                "Provide app.admin.password-file (preferred) or app.admin.password.");
    }
}
