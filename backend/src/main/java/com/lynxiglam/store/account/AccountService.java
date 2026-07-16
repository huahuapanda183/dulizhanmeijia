package com.lynxiglam.store.account;

import com.lynxiglam.store.common.dto.Dtos.ActionResultDto;
import com.lynxiglam.store.common.dto.Dtos.AuthRequest;
import com.lynxiglam.store.common.dto.Dtos.SubscribeRequest;
import com.lynxiglam.store.common.dto.Dtos.WishlistItemDto;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccountService {
    private final NamedParameterJdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    public AccountService(NamedParameterJdbcTemplate jdbc, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<CustomerCredentials> credentials(String email) {
        List<CustomerCredentials> rows = jdbc.query(
                "SELECT id, email, password_hash FROM customers WHERE email = :email",
                new MapSqlParameterSource("email", normalizeEmail(email)),
                (rs, rowNum) -> new CustomerCredentials(
                        rs.getString("id"), rs.getString("email"), rs.getString("password_hash")
                )
        );
        return rows.stream().findFirst();
    }

    @Transactional
    public ActionResultDto register(AuthRequest input) {
        String email = normalizeEmail(input.email());
        if (credentials(email).isPresent()) return new ActionResultDto(false, "An account already exists for this email.");
        try {
            jdbc.update(
                    "INSERT INTO customers (id, email, password_hash, first_name, last_name) VALUES (:id, :email, :password, :firstName, :lastName)",
                    new MapSqlParameterSource()
                            .addValue("id", UUID.randomUUID().toString()).addValue("email", email)
                            .addValue("password", passwordEncoder.encode(input.password()))
                            .addValue("firstName", input.firstName()).addValue("lastName", input.lastName())
            );
            return new ActionResultDto(true, "Account created.");
        } catch (DuplicateKeyException exception) {
            return new ActionResultDto(false, "An account already exists for this email.");
        }
    }

    public ActionResultDto subscribe(SubscribeRequest input) {
        String email = input.email() == null || input.email().isBlank() ? null : normalizeEmail(input.email());
        String phone = input.phone() == null || input.phone().isBlank() ? null : input.phone().trim();
        if (email == null && phone == null) return new ActionResultDto(false, "Enter an email or phone number.");
        if (email != null && !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return new ActionResultDto(false, "Please enter a valid email address.");
        }
        jdbc.update(
                "INSERT INTO newsletter_subscribers (email, phone, consent) VALUES (:email, :phone, :consent)",
                new MapSqlParameterSource().addValue("email", email).addValue("phone", phone)
                        .addValue("consent", Boolean.TRUE.equals(input.consent()))
        );
        return new ActionResultDto(true, "You're in! Check your inbox for your welcome offer.");
    }

    public List<WishlistItemDto> wishlist(String customerId) {
        return jdbc.query(
                "SELECT product_handle, added_at FROM wishlist_items WHERE customer_id = :customerId ORDER BY added_at DESC",
                new MapSqlParameterSource("customerId", customerId),
                (rs, rowNum) -> new WishlistItemDto(rs.getString("product_handle"), rs.getTimestamp("added_at").toInstant())
        );
    }

    @Transactional
    public void saveWishlist(String customerId, List<WishlistItemDto> items) {
        jdbc.update("DELETE FROM wishlist_items WHERE customer_id = :customerId", new MapSqlParameterSource("customerId", customerId));
        for (WishlistItemDto item : items) {
            jdbc.update(
                    "INSERT INTO wishlist_items (customer_id, product_handle, added_at) VALUES (:customerId, :handle, :addedAt)",
                    new MapSqlParameterSource().addValue("customerId", customerId).addValue("handle", item.handle())
                            .addValue("addedAt", item.addedAt() == null ? Instant.now() : item.addedAt())
            );
        }
    }

    public boolean passwordMatches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    public record CustomerCredentials(String id, String email, String passwordHash) {}
}
