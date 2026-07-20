package com.lynxiglam.store.checkout;

import com.lynxiglam.store.common.ConflictException;
import com.lynxiglam.store.common.Money;
import com.lynxiglam.store.common.NotFoundException;
import com.lynxiglam.store.common.dto.Dtos.AddressDto;
import com.lynxiglam.store.common.dto.Dtos.CartLineDto;
import com.lynxiglam.store.common.dto.Dtos.OrderDto;
import com.lynxiglam.store.common.dto.Dtos.OrderInputDto;
import com.lynxiglam.store.common.dto.Dtos.PromoResultDto;
import com.lynxiglam.store.common.dto.Dtos.ShippingRateDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class CheckoutService {
    /**
     * $1,000,000 in cents. Far above any legitimate order, and far below both
     * Integer.MAX_VALUE and the orders.*_cents INT UNSIGNED column limit, so the
     * subsequent shipping + tax additions cannot overflow the int either.
     */
    private static final long MAX_ORDER_CENTS = 100_000_000L;

    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper objectMapper;
    private final int freeShippingThresholdCents;
    private final BigDecimal taxRate;

    public CheckoutService(
            NamedParameterJdbcTemplate jdbc,
            ObjectMapper objectMapper,
            @Value("${app.commerce.free-shipping-threshold-cents}") int freeShippingThresholdCents,
            @Value("${app.commerce.tax-rate}") BigDecimal taxRate
    ) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
        this.freeShippingThresholdCents = freeShippingThresholdCents;
        this.taxRate = taxRate;
    }

    public List<ShippingRateDto> shippingRates(BigDecimal subtotal) {
        return shippingRates(subtotal, null, null, null);
    }

    /**
     * Extension point for destination-based rating. Today rates depend only on
     * subtotal (free-shipping threshold); {@code country}/{@code state}/{@code zip}
     * are accepted so region rules can be layered on without a contract change.
     */
    @SuppressWarnings("unused")
    public List<ShippingRateDto> shippingRates(BigDecimal subtotal, String country, String state, String zip) {
        int subtotalCents = Money.toCents(subtotal == null ? BigDecimal.ZERO : subtotal);
        return jdbc.query(
                "SELECT id, label, amount_cents, estimate, min_free_subtotal_cents FROM shipping_rates " +
                        "WHERE active = TRUE ORDER BY position",
                Map.of(),
                (rs, rowNum) -> {
                    int amount = rs.getInt("amount_cents");
                    Number freeAt = (Number) rs.getObject("min_free_subtotal_cents");
                    if (freeAt != null && subtotalCents >= freeAt.intValue()) amount = 0;
                    return new ShippingRateDto(rs.getString("id"), rs.getString("label"), Money.fromCents(amount), rs.getString("estimate"));
                }
        );
    }

    public PromoResultDto promo(String rawCode, BigDecimal subtotal) {
        String code = rawCode == null ? "" : rawCode.trim().toUpperCase(Locale.ROOT);
        int subtotalCents = Money.toCents(subtotal == null ? BigDecimal.ZERO : subtotal);
        List<PromoBase> rows = jdbc.query(
                "SELECT code, kind, value, min_subtotal_cents, active, expires_at FROM promo_codes WHERE code = :code",
                new MapSqlParameterSource("code", code),
                (rs, rowNum) -> {
                    // (Number), never (Integer): min_subtotal_cents is INT UNSIGNED, and
                    // MySQL Connector/J hands those back as Long — a direct (Integer) cast
                    // throws ClassCastException, which surfaced as a blanket HTTP 500 for
                    // every code that has a threshold (i.e. GLAM20). H2 types it as signed
                    // INT, so the tests passed while the live endpoint was broken.
                    // Matches the same pattern already used at shippingRates() above.
                    Number minSubtotal = (Number) rs.getObject("min_subtotal_cents");
                    return new PromoBase(
                            rs.getString("code"), rs.getString("kind"), rs.getInt("value"),
                            minSubtotal == null ? null : minSubtotal.intValue(), rs.getBoolean("active"),
                            rs.getTimestamp("expires_at") == null ? null : rs.getTimestamp("expires_at").toInstant()
                    );
                }
        );
        if (rows.isEmpty() || !rows.getFirst().active() || (rows.getFirst().expiresAt() != null && rows.getFirst().expiresAt().isBefore(Instant.now()))) {
            return new PromoResultDto(false, code, BigDecimal.ZERO, "That code isn't valid.");
        }
        PromoBase promo = rows.getFirst();
        if (promo.minSubtotalCents() != null && subtotalCents < promo.minSubtotalCents()) {
            return new PromoResultDto(false, code, BigDecimal.ZERO,
                    code + " requires a $" + Money.fromCents(promo.minSubtotalCents()) + "+ subtotal.");
        }
        int amount = switch (promo.kind()) {
            case "percent" -> Money.percentage(subtotalCents, promo.value());
            case "fixed" -> Math.min(subtotalCents, promo.value());
            case "free_ship" -> 0;
            default -> throw new IllegalArgumentException("Unsupported promo kind: " + promo.kind());
        };
        String message = promo.kind().equals("free_ship")
                ? "Free shipping applied!"
                : "Code applied — you saved $" + Money.fromCents(amount) + ".";
        return new PromoResultDto(true, code, Money.fromCents(amount), message);
    }

    @Transactional
    public OrderDto createOrder(OrderInputDto input) {
        OrderDto existing = findByIdempotencyKey(input.idempotencyKey());
        if (existing != null) return existing;

        List<CartLineDto> lines = new ArrayList<>();
        for (var requested : input.lines()) {
            List<CartLineDto> found = jdbc.query(
                    "SELECT handle, title, shape, price_cents, currency, " +
                            "(SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY position LIMIT 1) image " +
                            "FROM products p WHERE handle = :handle AND available = TRUE",
                    new MapSqlParameterSource("handle", requested.handle()),
                    (rs, rowNum) -> new CartLineDto(
                            rs.getString("handle"), rs.getString("handle"), rs.getString("title"), rs.getString("shape"),
                            rs.getString("image"), Money.fromCents(rs.getInt("price_cents")), rs.getString("currency"),
                            requested.quantity()
                    )
            );
            if (found.isEmpty()) throw new NotFoundException("Product is unavailable: " + requested.handle());
            lines.add(found.getFirst());
        }
        // Accumulate in long with checked arithmetic. The DTO bounds quantity/lines, but
        // this must hold on its own: an int subtotal silently wrapped (a 2.38M-unit order
        // of a $17.99 item was charged $12.84), and on H2's signed INT a wrapped negative
        // total even persisted. Overflow now becomes a 400, never a mispriced order.
        long subtotalLong = 0;
        for (CartLineDto line : lines) {
            long lineTotal = Math.multiplyExact((long) Money.toCents(line.price()), (long) line.quantity());
            subtotalLong = Math.addExact(subtotalLong, lineTotal);
        }
        if (subtotalLong > MAX_ORDER_CENTS) {
            throw new IllegalArgumentException("Order total exceeds the maximum permitted amount.");
        }
        int subtotal = (int) subtotalLong;
        ShippingRateDto selectedRate = shippingRates(Money.fromCents(subtotal)).stream()
                .filter(rate -> rate.id().equals(input.shippingRateId())).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown shipping rate: " + input.shippingRateId()));
        int shipping = Money.toCents(selectedRate.amount());
        int discount = 0;
        String promoCode = null;
        if (input.promoCode() != null && !input.promoCode().isBlank()) {
            PromoResultDto promo = promo(input.promoCode(), Money.fromCents(subtotal));
            if (promo.ok()) {
                promoCode = promo.code();
                if (promo.code().equals("FREESHIP")) shipping = 0;
                else discount = Money.toCents(promo.amount());
            }
        }
        int taxable = Math.max(0, subtotal - discount);
        int tax = Money.tax(taxable, taxRate);
        int total = taxable + shipping + tax;
        String id = UUID.randomUUID().toString();
        String number = "LX" + id.replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT);
        String currency = lines.isEmpty() ? "USD" : lines.getFirst().currency();
        String addressJson = toJson(input.shippingAddress());

        try {
            jdbc.update(
                    "INSERT INTO orders (id, number, email, subtotal_cents, shipping_cents, discount_cents, tax_cents, total_cents, currency, promo_code, status, shipping_address, idempotency_key) " +
                            "VALUES (:id, :number, :email, :subtotal, :shipping, :discount, :tax, :total, :currency, :promoCode, 'confirmed', :address, :idempotencyKey)",
                    new MapSqlParameterSource()
                            .addValue("id", id).addValue("number", number).addValue("email", input.email())
                            .addValue("subtotal", subtotal).addValue("shipping", shipping).addValue("discount", discount)
                            .addValue("tax", tax).addValue("total", total).addValue("currency", currency)
                            .addValue("promoCode", promoCode).addValue("address", addressJson)
                            .addValue("idempotencyKey", input.idempotencyKey())
            );
            for (CartLineDto line : lines) {
                jdbc.update(
                        "INSERT INTO order_lines (order_id, product_handle, title, shape, image, unit_price_cents, quantity) " +
                                "VALUES (:orderId, :handle, :title, :shape, :image, :price, :quantity)",
                        new MapSqlParameterSource()
                                .addValue("orderId", id).addValue("handle", line.handle()).addValue("title", line.title())
                                .addValue("shape", line.shape()).addValue("image", line.image())
                                .addValue("price", Money.toCents(line.price())).addValue("quantity", line.quantity())
                );
            }
        } catch (DuplicateKeyException exception) {
            OrderDto concurrent = findByIdempotencyKey(input.idempotencyKey());
            if (concurrent != null) return concurrent;
            throw new ConflictException("Order submission conflicted. Please retry.");
        }
        return findByIdempotencyKey(input.idempotencyKey());
    }

    private OrderDto findByIdempotencyKey(String idempotencyKey) {
        List<OrderBase> orders = jdbc.query(
                "SELECT id, number, email, subtotal_cents, shipping_cents, discount_cents, tax_cents, total_cents, currency, status, shipping_address, created_at " +
                        "FROM orders WHERE idempotency_key = :key",
                new MapSqlParameterSource("key", idempotencyKey), this::mapOrderBase
        );
        if (orders.isEmpty()) return null;
        OrderBase order = orders.getFirst();
        List<CartLineDto> lines = jdbc.query(
                "SELECT product_handle, title, shape, image, unit_price_cents, quantity FROM order_lines WHERE order_id = :id ORDER BY id",
                new MapSqlParameterSource("id", order.id()),
                (rs, rowNum) -> new CartLineDto(
                        rs.getString("product_handle"), rs.getString("product_handle"), rs.getString("title"),
                        rs.getString("shape"), rs.getString("image"), Money.fromCents(rs.getInt("unit_price_cents")),
                        order.currency(), rs.getInt("quantity")
                )
        );
        return new OrderDto(
                order.id(), order.number(), order.email(), lines, Money.fromCents(order.subtotal()),
                Money.fromCents(order.shipping()), Money.fromCents(order.discount()), Money.fromCents(order.tax()),
                Money.fromCents(order.total()), order.currency(), fromJson(order.addressJson()), order.status(), order.createdAt()
        );
    }

    private OrderBase mapOrderBase(ResultSet rs, int rowNum) throws SQLException {
        return new OrderBase(
                rs.getString("id"), rs.getString("number"), rs.getString("email"), rs.getInt("subtotal_cents"),
                rs.getInt("shipping_cents"), rs.getInt("discount_cents"), rs.getInt("tax_cents"),
                rs.getInt("total_cents"), rs.getString("currency"), rs.getString("status"),
                rs.getString("shipping_address"), rs.getTimestamp("created_at").toInstant()
        );
    }

    private String toJson(AddressDto address) {
        try {
            return objectMapper.writeValueAsString(address);
        } catch (JacksonException exception) {
            throw new IllegalArgumentException("Invalid shipping address.", exception);
        }
    }

    private AddressDto fromJson(String json) {
        try {
            return objectMapper.readValue(json, AddressDto.class);
        } catch (JacksonException exception) {
            throw new IllegalStateException("Stored shipping address is invalid.", exception);
        }
    }

    private record PromoBase(String code, String kind, int value, Integer minSubtotalCents, boolean active, Instant expiresAt) {}
    private record OrderBase(
            String id, String number, String email, int subtotal, int shipping, int discount, int tax, int total,
            String currency, String status, String addressJson, Instant createdAt
    ) {}
}
