package com.lynxiglam.store;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Regressions for the LOW findings: the shared HttpSession, unclamped percent
 * promos, unstable paging order, and the denormalized review columns.
 */
class SharedSessionAndDataIntegrityTest extends AbstractIntegrationTest {

    @Test
    void adminLogoutDoesNotSignOutTheCustomerSharingTheSession() throws Exception {
        // One browser, one HttpSession, both logins. invalidate() used to nuke both.
        MockHttpSession session = loginAsCustomer("dual@example.com", "hunter2hunter2");
        POST("/admin/login", "{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"" + ADMIN_PASSWORD + "\"}", session);
        assertTrue(json(GET("/admin/session", session)).get("authenticated").asBoolean());
        assertEquals(200, GET("/account/wishlist", session).getStatus());

        assertTrue(json(POST("/admin/logout", "", session)).get("ok").asBoolean());

        // Admin half gone...
        assertTrue(!json(GET("/admin/session", session)).get("authenticated").asBoolean(),
                "admin must be signed out");
        // Anonymous again, so the entry point answers 401 (403 would mean "known
        // principal, wrong role").
        assertEquals(401, GET("/analytics", session).getStatus());
        // ...customer half intact.
        assertEquals(200, GET("/account/wishlist", session).getStatus(),
                "the shopper must stay signed in");
    }

    @Test
    void adminOnlyLogoutStillDropsTheWholeSession() throws Exception {
        MockHttpSession session = loginAsAdmin();
        POST("/admin/logout", "", session);
        assertTrue(!json(GET("/admin/session", session)).get("authenticated").asBoolean());
    }

    @Test
    void percentPromoCannotDiscountMoreThanTheSubtotal() throws Exception {
        // Nothing constrains promo_codes.value to 0-100; a mis-keyed 150 used to
        // return a discount larger than the subtotal.
        jdbc.update("INSERT INTO promo_codes (code, kind, value, min_subtotal_cents) VALUES ('OOPS150', 'percent', 150, NULL)");

        JsonNode promo = json(POST("/checkout/promo", "{\"code\":\"OOPS150\",\"subtotal\":40.00}"));
        assertTrue(promo.get("ok").asBoolean());
        assertEquals(0, promo.get("amount").decimalValue().compareTo(new java.math.BigDecimal("40.00")),
                "discount is capped at the subtotal, got " + promo.get("amount"));
    }

    @Test
    void pagingIsATotalOrderSoNoProductIsLostOrRepeated() throws Exception {
        int total = getJson("/products").size();

        for (String sort : new String[] {"featured", "price-asc", "rating", "best-selling", "newest"}) {
            java.util.List<String> paged = new java.util.ArrayList<>();
            for (int page = 1; paged.size() < total; page++) {
                JsonNode chunk = getJson("/products?sort=" + sort + "&page=" + page + "&pageSize=5");
                if (chunk.isEmpty()) break;
                chunk.forEach(p -> paged.add(p.get("handle").asText()));
            }
            assertEquals(total, paged.size(), sort + ": paging returned a different count");
            assertEquals(total, new java.util.HashSet<>(paged).size(),
                    sort + ": a product appeared on two pages -> " + paged);
        }
    }

    @Test
    void reviewsShowTheRealProductNotTheStaleDenormalizedCopy() throws Exception {
        // V2 seeds r1 (citrus-coast) with product_title 'Galactic'. The API must
        // report the catalog's title, not the stale copy.
        String stored = jdbc.queryForObject(
                "SELECT product_title FROM reviews WHERE id = 'r1'", String.class);
        String actual = jdbc.queryForObject(
                "SELECT title FROM products WHERE handle = 'citrus-coast'", String.class);
        assertNotEquals(actual, stored, "this test is only meaningful while the seed is stale");

        JsonNode reviews = getJson("/reviews?productHandle=citrus-coast");
        assertTrue(!reviews.isEmpty());
        assertEquals(actual, reviews.get(0).get("productTitle").asText());
    }

    @Test
    void unknownRoutesStayDeniedRatherThanConfirmingWhatExists() throws Exception {
        // Deliberate: deny-by-default. A 404 here would enumerate the API surface
        // for an unauthenticated caller. Pinned so nobody "fixes" it by accident.
        MockHttpServletResponse response = GET("/definitely-not-a-route");
        assertEquals(401, response.getStatus());
    }
}
