package com.lynxiglam.store.common;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Guards the JSON field-name contract with the TypeScript StoreApi types. Any
 * rename on the Java side that drifts from {@code src/lib/data/types.ts} fails here.
 */
class ContractShapeTest extends AbstractIntegrationTest {

    private void assertHasAll(JsonNode node, String... fields) {
        for (String field : fields) assertTrue(node.has(field), "missing field: " + field);
    }

    @Test
    void productShapeMatchesTypescript() throws Exception {
        JsonNode product = getJson("/products").get(0);
        assertHasAll(product, "id", "handle", "title", "shape", "price", "currency",
                "rating", "reviewCount", "images", "collections", "description", "available", "tags", "createdAt");
        assertTrue(product.get("images").isArray());
        assertTrue(product.get("tags").isArray());
        assertTrue(product.get("collections").isArray());
        // non_null inclusion: an absent optional must be omitted, not serialized as null.
        assertFalse(product.has("compareAtPrice") && product.get("compareAtPrice").isNull());
    }

    @Test
    void facetsShapeMatchesTypescript() throws Exception {
        JsonNode facets = getJson("/products/facets");
        assertHasAll(facets, "shapes", "tags", "priceRange");
        assertHasAll(facets.get("priceRange"), "min", "max");
        assertHasAll(facets.get("shapes").get(0), "value", "label", "count");
    }

    @Test
    void orderShapeMatchesTypescript() throws Exception {
        String handle = getJson("/products").get(0).get("handle").asText();
        String body = "{\"lines\":[{\"handle\":\"" + handle + "\",\"quantity\":1}]," +
                "\"email\":\"c@ex.com\"," +
                "\"shippingAddress\":{\"firstName\":\"A\",\"lastName\":\"B\",\"email\":\"c@ex.com\"," +
                "\"line1\":\"1 St\",\"city\":\"NY\",\"state\":\"NY\",\"zip\":\"10001\",\"country\":\"US\"}," +
                "\"shippingRateId\":\"standard\",\"idempotencyKey\":\"shape-1\"}";
        JsonNode order = json(POST("/orders", body));
        assertHasAll(order, "id", "number", "email", "lines", "subtotal", "shipping",
                "discount", "tax", "total", "currency", "shippingAddress", "status", "createdAt");
        assertHasAll(order.get("lines").get(0), "id", "handle", "title", "shape", "image", "price", "currency", "quantity");
        assertHasAll(order.get("shippingAddress"), "firstName", "lastName", "email", "line1", "city", "state", "zip", "country");
    }

    @Test
    void analyticsSummaryShapeMatchesTypescript() throws Exception {
        String handle = getJson("/products").get(0).get("handle").asText();
        POST("/analytics/events", "{\"type\":\"view\",\"handle\":\"" + handle + "\",\"title\":\"T\"}");
        MockHttpSession admin = loginAsAdmin();
        JsonNode summary = json(GET("/analytics", admin));
        assertHasAll(summary, "totalViews", "totalClicks", "totalAdds", "products");
        assertHasAll(summary.get("products").get(0), "handle", "title", "views", "clicks", "adds");
    }

    @Test
    void openApiDocsAreAvailable() throws Exception {
        MockHttpServletResponse response = GET("/v3/api-docs");
        assertEquals(200, response.getStatus());
        JsonNode docs = json(response);
        assertTrue(docs.has("openapi"));
        JsonNode paths = docs.get("paths");
        assertTrue(paths.size() > 0, "OpenAPI should document endpoints");
        assertTrue(paths.toString().contains("/products"), "OpenAPI should document a /products path");
    }
}
