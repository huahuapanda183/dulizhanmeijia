package com.lynxiglam.store.common;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ErrorContractTest extends AbstractIntegrationTest {

    private void assertNotFound(String path) throws Exception {
        MockHttpServletResponse response = GET(path);
        assertEquals(404, response.getStatus(), path);
        JsonNode body = json(response);
        assertEquals("not_found", body.get("code").asText());
        assertNotNull(body.get("message").asText());
        assertNotNull(body.get("timestamp"));
    }

    @Test
    void missingResourcesReturn404WithApiError() throws Exception {
        assertNotFound("/products/__nope__");
        assertNotFound("/collections/__nope__");
        assertNotFound("/pages/__nope__");
        assertNotFound("/blog/__nope__");
    }

    @Test
    void orderMissingShippingAddressIsRejected() throws Exception {
        String body = "{\"lines\":[{\"handle\":\"x\",\"quantity\":1}],\"email\":\"a@b.com\"," +
                "\"shippingRateId\":\"standard\",\"idempotencyKey\":\"k1\"}";
        MockHttpServletResponse response = POST("/orders", body);
        assertEquals(400, response.getStatus(), response.getContentAsString());
        JsonNode json = json(response);
        assertEquals("validation_failed", json.get("code").asText());
        assertTrue(json.get("fields").has("shippingAddress"), "should flag shippingAddress: " + response.getContentAsString());
    }

    @Test
    void orderWithInvalidEmailIsRejected() throws Exception {
        String body = "{\"lines\":[{\"handle\":\"x\",\"quantity\":1}],\"email\":\"not-an-email\"," +
                "\"shippingAddress\":{\"firstName\":\"A\",\"lastName\":\"B\",\"email\":\"a@b.com\"," +
                "\"line1\":\"1 St\",\"city\":\"NY\",\"state\":\"NY\",\"zip\":\"10001\",\"country\":\"US\"}," +
                "\"shippingRateId\":\"standard\",\"idempotencyKey\":\"k2\"}";
        MockHttpServletResponse response = POST("/orders", body);
        assertEquals(400, response.getStatus(), response.getContentAsString());
        assertEquals("validation_failed", json(response).get("code").asText());
    }

    @Test
    void blankPromoCodeIsRejected() throws Exception {
        MockHttpServletResponse response = POST("/checkout/promo", "{\"code\":\"\",\"subtotal\":50}");
        assertEquals(400, response.getStatus(), response.getContentAsString());
        assertEquals("validation_failed", json(response).get("code").asText());
    }
}
