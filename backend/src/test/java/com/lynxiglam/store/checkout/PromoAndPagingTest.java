package com.lynxiglam.store.checkout;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Regressions for the MEDIUM findings around promo handling and paging bounds.
 */
class PromoAndPagingTest extends AbstractIntegrationTest {

    private String orderBody(String handle, int qty, String rateId, String promo, String key) {
        String promoField = promo == null ? "" : "\"promoCode\":\"" + promo + "\",";
        return "{\"lines\":[{\"handle\":\"" + handle + "\",\"quantity\":" + qty + "}]," +
                "\"email\":\"promo@example.com\"," +
                "\"shippingAddress\":{\"firstName\":\"A\",\"lastName\":\"B\",\"email\":\"promo@example.com\"," +
                "\"line1\":\"1 St\",\"city\":\"NY\",\"state\":\"NY\",\"zip\":\"10001\",\"country\":\"US\"}," +
                "\"shippingRateId\":\"" + rateId + "\"," + promoField +
                "\"idempotencyKey\":\"" + key + "\"}";
    }

    private String handle() throws Exception {
        return getJson("/products").get(0).get("handle").asText();
    }

    private int cents(JsonNode money) {
        return money.decimalValue().movePointRight(2).intValueExact();
    }

    @Test
    void unknownPromoCodeIsRejectedInsteadOfSilentlyChargingFullPrice() throws Exception {
        MockHttpServletResponse response = POST("/orders", orderBody(handle(), 1, "standard", "BOGUSCODE", "promo-1"));
        // Previously: 200, full price, no signal — the customer thought a discount applied.
        assertEquals(400, response.getStatus(), response.getContentAsString());
        assertEquals(0, jdbc.queryForObject(
                "SELECT COUNT(*) FROM orders WHERE idempotency_key = 'promo-1'", Integer.class));
    }

    @Test
    void promoBelowItsThresholdIsRejectedNotIgnored() throws Exception {
        // GLAM20 requires a $65 subtotal; one unit is far below it.
        MockHttpServletResponse response = POST("/orders", orderBody(handle(), 1, "standard", "GLAM20", "promo-2"));
        assertEquals(400, response.getStatus(), response.getContentAsString());
        assertTrue(response.getContentAsString().contains("GLAM20"),
                "the message should say why: " + response.getContentAsString());
        assertEquals(0, jdbc.queryForObject(
                "SELECT COUNT(*) FROM orders WHERE idempotency_key = 'promo-2'", Integer.class));
    }

    @Test
    void freeShippingIsDecidedByKindNotByTheLiteralCodeName() throws Exception {
        // A second free_ship code that is NOT called "FREESHIP". The old code compared
        // the literal name, so this one announced free shipping and then charged it.
        jdbc.update("INSERT INTO promo_codes (code, kind, value, min_subtotal_cents) VALUES ('SHIPFREE', 'free_ship', 0, NULL)");

        JsonNode order = json(POST("/orders", orderBody(handle(), 1, "express", "SHIPFREE", "promo-3")));
        assertEquals(0, cents(order.get("shipping")), "shipping must actually be waived");
        assertEquals(0, cents(order.get("discount")), "free_ship grants no line discount");
    }

    @Test
    void validPromoStillApplies() throws Exception {
        JsonNode order = json(POST("/orders", orderBody(handle(), 1, "express", "SAVE15", "promo-4")));
        int subtotal = cents(order.get("subtotal"));
        assertEquals(Math.round(subtotal * 15 / 100.0), cents(order.get("discount")));
    }

    @Test
    void outOfRangePagingIsRejectedRatherThanReturningEverything() throws Exception {
        int total = getJson("/products").size();

        // page=0 / page=-1 used to drop the LIMIT clause and return the whole catalog.
        for (String qs : new String[] {"page=0&pageSize=5", "page=-1&pageSize=5", "pageSize=0", "limit=0", "limit=-3"}) {
            MockHttpServletResponse response = GET("/products?" + qs);
            assertEquals(400, response.getStatus(), qs + " -> " + response.getContentAsString());
        }

        // Over-large values are refused too, so one request cannot ask for everything.
        assertEquals(400, GET("/products?pageSize=100000").getStatus());
        assertEquals(400, GET("/products?limit=100000").getStatus());

        // And valid paging still works.
        assertEquals(5, getJson("/products?page=1&pageSize=5").size());
        assertTrue(getJson("/products").size() == total);
    }

    @Test
    void negativeRecommendationLimitIsRejected() throws Exception {
        assertEquals(400, GET("/products/" + handle() + "/recommendations?limit=-3").getStatus());
        assertTrue(getJson("/products/" + handle() + "/recommendations?limit=4").size() <= 4);
    }
}
