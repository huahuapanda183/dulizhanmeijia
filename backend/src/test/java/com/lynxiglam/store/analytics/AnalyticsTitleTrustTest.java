package com.lynxiglam.store.analytics;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Regression: POST /analytics/events is unauthenticated, and it used to write the
 * caller-supplied `title` into analytics_daily via `title = VALUES(title)`. Anyone
 * could therefore choose what an admin saw for a product in the analytics report
 * (proved by posting "PWNED-BY-AUDIT"). Titles must come from the catalog.
 */
class AnalyticsTitleTrustTest extends AbstractIntegrationTest {

    @Test
    void clientSuppliedTitleIsIgnoredInFavourOfTheCatalogTitle() throws Exception {
        JsonNode product = getJson("/products").get(0);
        String handle = product.get("handle").asText();
        String realTitle = product.get("title").asText();

        assertEquals(204, POST("/analytics/events",
                "{\"type\":\"view\",\"handle\":\"" + handle + "\",\"title\":\"PWNED-BY-AUDIT\"}").getStatus());

        // What the DB stored.
        String stored = jdbc.queryForObject(
                "SELECT title FROM analytics_daily WHERE product_handle = ?", String.class, handle);
        assertEquals(realTitle, stored, "the catalog title must win over the request body");

        // And what an admin actually sees.
        MockHttpSession admin = loginAsAdmin();
        JsonNode summary = json(GET("/analytics", admin));
        String reported = null;
        for (JsonNode row : summary.get("products")) {
            if (row.get("handle").asText().equals(handle)) reported = row.get("title").asText();
        }
        assertNotNull(reported, "the product must appear in the report");
        assertEquals(realTitle, reported, "admin report must not show attacker-controlled text");
    }

    @Test
    void anOverlongTitleCannotBreakIngestion() throws Exception {
        // title column is VARCHAR(255); a long body value used to reach it directly.
        String handle = getJson("/products").get(0).get("handle").asText();
        String huge = "x".repeat(5000);
        assertEquals(204, POST("/analytics/events",
                "{\"type\":\"view\",\"handle\":\"" + handle + "\",\"title\":\"" + huge + "\"}").getStatus());
    }
}
