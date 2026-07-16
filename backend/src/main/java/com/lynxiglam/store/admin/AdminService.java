package com.lynxiglam.store.admin;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/**
 * Admin credential store. Backed by the {@code admin_users} table; passwords are
 * BCrypt-hashed via the shared {@link PasswordEncoder}. This is intentionally
 * small and swappable — a future SSO/OIDC provider can replace it without
 * touching the session wiring in {@link AdminSessionAuthenticationFilter}.
 */
@Service
public class AdminService {
    private final NamedParameterJdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    public AdminService(NamedParameterJdbcTemplate jdbc, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<AdminRecord> findByEmail(String email) {
        List<AdminRecord> rows = jdbc.query(
                "SELECT id, email, password_hash FROM admin_users WHERE email = :email AND active = TRUE",
                new MapSqlParameterSource("email", normalize(email)),
                (rs, rowNum) -> new AdminRecord(rs.getString("id"), rs.getString("email"), rs.getString("password_hash"))
        );
        return rows.stream().findFirst();
    }

    public boolean passwordMatches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /** Idempotently create a default admin (dev/local bootstrap only). No-op if one exists. */
    public boolean ensureAdmin(String email, String rawPassword, String role) {
        if (findByEmail(email).isPresent()) return false;
        jdbc.update(
                "INSERT INTO admin_users (id, email, password_hash, role) VALUES (:id, :email, :hash, :role)",
                new MapSqlParameterSource()
                        .addValue("id", UUID.randomUUID().toString())
                        .addValue("email", normalize(email))
                        .addValue("hash", passwordEncoder.encode(rawPassword))
                        .addValue("role", role)
        );
        return true;
    }

    private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    public record AdminRecord(String id, String email, String passwordHash) {}
}
