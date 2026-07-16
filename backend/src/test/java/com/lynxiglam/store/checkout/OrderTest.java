package com.lynxiglam.store.checkout;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderTest extends AbstractIntegrationTest {
    private static final BigDecimal TAX_RATE = new BigDecimal("0.0725");

    private JsonNode product(int index) throws Exception {
        return getJson("/products").get(index);
    }

    private int cents(String major) {
        return new BigDecimal(major).multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).intValueExact();
    }

    private int centsOf(JsonNode money) {
        return cents(money.asText());
    }

    private String orderBody(String handle, int qty, String rateId, String promo, String key) {
        String promoField = promo == null ? "" : "\"promoCode\":\"" + promo + "\",";
        return "{\"lines\":[{\"handle\":\"" + handle + "\",\"quantity\":" + qty + "}]," +
                "\"email\":\"buyer@example.com\"," +
                "\"shippingAddress\":{\"firstName\":\"A\",\"lastName\":\"B\",\"email\":\"buyer@example.com\"," +
                "\"line1\":\"1 St\",\"city\":\"NY\",\"state\":\"NY\",\"zip\":\"10001\",\"country\":\"US\"}," +
                "\"shippingRateId\":\"" + rateId + "\"," + promoField +
                "\"idempotencyKey\":\"" + key + "\"}";
    }

    private JsonNode postOrder(String body) throws Exception {
        MockHttpServletResponse response = POST("/orders", body);
        assertEquals(200, response.getStatus(), response.getContentAsString());
        return json(response);
    }

    @Test
    void computesSubtotalShippingTaxWithStandardRate() throws Exception {
        JsonNode p = product(0);
        int subtotal = centsOf(p.get("price"));
        JsonNode order = postOrder(orderBody(p.get("handle").asText(), 1, "standard", null, "ord-std"));

        int shipping = subtotal >= 6500 ? 0 : 595;
        int tax = BigDecimal.valueOf(subtotal).multiply(TAX_RATE).setScale(0, RoundingMode.HALF_UP).intValueExact();
        assertEquals(subtotal, centsOf(order.get("subtotal")));
        assertEquals(shipping, centsOf(order.get("shipping")));
        assertEquals(0, centsOf(order.get("discount")));
        assertEquals(tax, centsOf(order.get("tax")));
        assertEquals(subtotal + shipping + tax, centsOf(order.get("total")));
        assertEquals("confirmed", order.get("status").asText());
        assertTrue(order.get("number").asText().startsWith("LX"));
    }

    @Test
    void appliesPercentagePromoBeforeTax() throws Exception {
        JsonNode p = product(0);
        int subtotal = centsOf(p.get("price"));
        JsonNode order = postOrder(orderBody(p.get("handle").asText(), 1, "express", "WELCOME10", "ord-welcome"));

        int discount = BigDecimal.valueOf(subtotal).multiply(BigDecimal.TEN)
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP).intValueExact();
        int taxable = subtotal - discount;
        int tax = BigDecimal.valueOf(taxable).multiply(TAX_RATE).setScale(0, RoundingMode.HALF_UP).intValueExact();
        assertEquals(discount, centsOf(order.get("discount")));
        assertEquals(1295, centsOf(order.get("shipping"))); // express is never free
        assertEquals(taxable + 1295 + tax, centsOf(order.get("total")));
    }

    @Test
    void freeshipPromoZeroesShipping() throws Exception {
        JsonNode p = product(0);
        JsonNode order = postOrder(orderBody(p.get("handle").asText(), 1, "express", "FREESHIP", "ord-freeship"));
        assertEquals(0, centsOf(order.get("shipping")));
        assertEquals(0, centsOf(order.get("discount")));
    }

    @Test
    void glam20RequiresThresholdThenAppliesFixedDiscount() throws Exception {
        JsonNode p = product(0);
        int priceCents = centsOf(p.get("price"));
        int qty = (int) Math.ceil(6600.0 / priceCents); // exceed $65
        int subtotal = priceCents * qty;
        JsonNode order = postOrder(orderBody(p.get("handle").asText(), qty, "express", "GLAM20", "ord-glam20"));
        assertEquals(2000, centsOf(order.get("discount")));
        int taxable = subtotal - 2000;
        int tax = BigDecimal.valueOf(taxable).multiply(TAX_RATE).setScale(0, RoundingMode.HALF_UP).intValueExact();
        assertEquals(taxable + 1295 + tax, centsOf(order.get("total")));
    }

    @Test
    void unknownShippingRateIsBadRequest() throws Exception {
        JsonNode p = product(0);
        MockHttpServletResponse response = POST("/orders", orderBody(p.get("handle").asText(), 1, "teleport", null, "ord-badrate"));
        assertEquals(400, response.getStatus(), response.getContentAsString());
    }

    @Test
    void unknownProductIsNotFound() throws Exception {
        MockHttpServletResponse response = POST("/orders", orderBody("__ghost__", 1, "standard", null, "ord-ghost"));
        assertEquals(404, response.getStatus(), response.getContentAsString());
    }

    @Test
    void sameIdempotencyKeyReturnsIdenticalOrder() throws Exception {
        JsonNode p = product(0);
        String body = orderBody(p.get("handle").asText(), 2, "standard", null, "ord-idem");
        JsonNode first = postOrder(body);
        JsonNode second = postOrder(body);
        assertEquals(first.get("id").asText(), second.get("id").asText());
        assertEquals(first.get("number").asText(), second.get("number").asText());
        assertEquals(centsOf(first.get("total")), centsOf(second.get("total")));
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM orders WHERE idempotency_key = 'ord-idem'", Integer.class));
    }
}
