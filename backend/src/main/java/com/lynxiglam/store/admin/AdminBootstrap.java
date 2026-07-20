package com.lynxiglam.store.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Seeds a default admin for local development so the admin UI has a login to
 * exercise. Restricted to the {@code dev}/{@code local} profiles — production
 * must provision admins deliberately (never auto-seed a known password).
 */
@Component
@Profile({"dev", "local"})
public class AdminBootstrap implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AdminService admins;
    private final String email;
    private final String password;

    public AdminBootstrap(
            AdminService admins,
            @Value("${app.admin.email:admin@lynxiglam.local}") String email,
            @Value("${app.admin.password:admin@lynxiglam.local}") String password
    ) {
        this.admins = admins;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (admins.ensureAdmin(email, password, "ADMIN")) {
            log.info("Seeded default dev admin '{}'. Change the password before any non-local use.", email);
        }
    }
}
