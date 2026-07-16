package com.lynxiglam.store.config;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;

class SecurityCorsTest extends AbstractIntegrationTest {

    private MockHttpServletResponse preflight(String origin) throws Exception {
        return mvc.perform(options("/products")
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "GET")).andReturn().getResponse();
    }

    @Test
    void allowsConfiguredStorefrontOrigin() throws Exception {
        MockHttpServletResponse response = preflight("http://localhost:3000");
        assertEquals("http://localhost:3000", response.getHeader("Access-Control-Allow-Origin"));
        assertEquals("true", response.getHeader("Access-Control-Allow-Credentials"));
    }

    @Test
    void rejectsUnknownOrigin() throws Exception {
        MockHttpServletResponse response = preflight("http://evil.example.com");
        assertNull(response.getHeader("Access-Control-Allow-Origin"), "disallowed origin must not be echoed back");
    }

    @Test
    void publicReadsAndWritesDoNotRequireAuth() throws Exception {
        assertEquals(200, GET("/products").getStatus());
        assertEquals(200, GET("/collections").getStatus());
        assertEquals(200, GET("/navigation").getStatus());
        assertEquals(200, GET("/checkout/shipping-rates?subtotal=50").getStatus());
        assertEquals(200, POST("/checkout/promo", "{\"code\":\"WELCOME10\",\"subtotal\":50}").getStatus());
    }

    @Test
    void adminSessionEndpointReportsAnonymous() throws Exception {
        MockHttpServletResponse response = GET("/admin/session");
        assertEquals(200, response.getStatus());
        assertFalse(json(response).get("authenticated").asBoolean());
    }
}
