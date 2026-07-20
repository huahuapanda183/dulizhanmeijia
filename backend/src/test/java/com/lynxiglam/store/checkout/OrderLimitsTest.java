package com.lynxiglam.store.checkout;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Regressions for the 32-bit subtotal overflow.
 *
 * A real order for 2,387,420 units of a $17.99 product was accepted and charged
 * $12.84, because 1799 * 2387420 wraps modulo 2^32. Nothing bounded quantity and
 * the subtotal accumulated in an int.
 */
class OrderLimitsTest extends AbstractIntegrationTest {

    private String orderBody(String handle, long quantity, String key) {
        return "{\"lines\":[{\"handle\":\"" + handle + "\",\"quantity\":" + quantity + "}]," +
                "\"email\":\"limits@example.com\"," +
                "\"shippingAddress\":{\"firstName\":\"A\",\"lastName\":\"B\",\"email\":\"limits@example.com\"," +
                "\"line1\":\"1 St\",\"city\":\"NY\",\"state\":\"NY\",\"zip\":\"10001\",\"country\":\"US\"}," +
                "\"shippingRateId\":\"standard\",\"idempotencyKey\":\"" + key + "\"}";
    }

    private String handle() throws Exception {
        return getJson("/products").get(0).get("handle").asText();
    }

    @Test
    void quantityThatWouldOverflowTheSubtotalIsRejected() throws Exception {
        // The exact exploit quantity from the audit.
        MockHttpServletResponse response = POST("/orders", orderBody(handle(), 2_387_420L, "ovf-1"));
        assertEquals(400, response.getStatus(), response.getContentAsString());
        assertEquals("validation_failed", json(response).get("code").asText());
        assertTrue(json(response).get("fields").toString().contains("quantity"),
                "the rejection must point at quantity: " + response.getContentAsString());
        assertEquals(0, countOrders("ovf-1"), "no order row may be created");
    }

    @Test
    void quantityAboveTheCapIsRejectedButTheCapItselfIsUsable() throws Exception {
        assertEquals(400, POST("/orders", orderBody(handle(), 1000, "ovf-2")).getStatus());
        assertEquals(0, countOrders("ovf-2"));

        // 999 is the documented maximum and must still work.
        MockHttpServletResponse ok = POST("/orders", orderBody(handle(), 999, "ovf-3"));
        assertEquals(200, ok.getStatus(), ok.getContentAsString());
        JsonNode order = json(ok);
        // The whole point: the charged subtotal is the true one, not a wrapped one.
        int priceCents = getJson("/products").get(0).get("price").decimalValue()
                .movePointRight(2).intValueExact();
        int expected = priceCents * 999;
        int actual = order.get("subtotal").decimalValue().movePointRight(2).intValueExact();
        assertEquals(expected, actual, "subtotal must not wrap");
        assertTrue(actual > 0, "subtotal must be positive");
    }

    @Test
    void zeroAndNegativeQuantitiesAreRejected() throws Exception {
        assertEquals(400, POST("/orders", orderBody(handle(), 0, "ovf-4")).getStatus());
        assertEquals(400, POST("/orders", orderBody(handle(), -5, "ovf-5")).getStatus());
        assertEquals(0, countOrders("ovf-4"));
        assertEquals(0, countOrders("ovf-5"));
    }

    @Test
    void tooManyLinesAreRejected() throws Exception {
        String handle = handle();
        StringBuilder lines = new StringBuilder();
        for (int i = 0; i < 201; i++) {
            if (i > 0) lines.append(",");
            lines.append("{\"handle\":\"").append(handle).append("\",\"quantity\":1}");
        }
        String body = "{\"lines\":[" + lines + "],\"email\":\"limits@example.com\"," +
                "\"shippingAddress\":{\"firstName\":\"A\",\"lastName\":\"B\",\"email\":\"limits@example.com\"," +
                "\"line1\":\"1 St\",\"city\":\"NY\",\"state\":\"NY\",\"zip\":\"10001\",\"country\":\"US\"}," +
                "\"shippingRateId\":\"standard\",\"idempotencyKey\":\"ovf-6\"}";
        assertEquals(400, POST("/orders", body).getStatus());
        assertEquals(0, countOrders("ovf-6"));
    }

    @Test
    void outOfRangeQueryNumbersAre400NotServerErrors() throws Exception {
        // Money.toCents uses intValueExact(); an absurd value threw ArithmeticException
        // and fell through to the catch-all as a 500.
        MockHttpServletResponse response = GET("/checkout/shipping-rates?subtotal=99999999999");
        assertNotEquals(500, response.getStatus(), "must not be a server error");
        assertEquals(400, response.getStatus(), response.getContentAsString());
    }

    private int countOrders(String idempotencyKey) {
        Integer n = jdbc.queryForObject(
                "SELECT COUNT(*) FROM orders WHERE idempotency_key = ?", Integer.class, idempotencyKey);
        return n == null ? 0 : n;
    }
}
