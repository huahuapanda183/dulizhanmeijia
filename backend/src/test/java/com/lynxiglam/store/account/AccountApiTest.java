package com.lynxiglam.store.account;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AccountApiTest extends AbstractIntegrationTest {

    private String someHandle() throws Exception {
        return getJson("/products").get(0).get("handle").asText();
    }

    @Test
    void registerThenDuplicateThenLoginFlow() throws Exception {
        String creds = "{\"email\":\"shopper@ex.com\",\"password\":\"secret123\"}";
        assertTrue(json(POST("/account/register", creds)).get("ok").asBoolean());
        assertFalse(json(POST("/account/register", creds)).get("ok").asBoolean(), "duplicate registration must fail");

        MockHttpSession session = new MockHttpSession();
        assertTrue(json(POST("/account/login", creds, session)).get("ok").asBoolean());
        assertNotNull(session.getAttribute("customerId"), "login must establish a customer session");
    }

    @Test
    void wrongPasswordDoesNotAuthenticate() throws Exception {
        String creds = "{\"email\":\"who@ex.com\",\"password\":\"secret123\"}";
        POST("/account/register", creds);
        JsonNode result = json(POST("/account/login", "{\"email\":\"who@ex.com\",\"password\":\"WRONG\"}"));
        assertFalse(result.get("ok").asBoolean());
        assertEquals("Invalid email or password.", result.get("message").asText());
    }

    @Test
    void wishlistRequiresSession() throws Exception {
        MockHttpServletResponse anon = GET("/account/wishlist");
        assertEquals(401, anon.getStatus());
        assertEquals("unauthorized", json(anon).get("code").asText());
    }

    @Test
    void wishlistPersistsForSignedInCustomer() throws Exception {
        MockHttpSession session = loginAsCustomer("wish@ex.com", "secret123");
        assertNotNull(session.getAttribute("customerId"));
        String handle = someHandle();
        MockHttpServletResponse saved = PUT("/account/wishlist", "[{\"handle\":\"" + handle + "\"}]", session);
        assertEquals(200, saved.getStatus(), saved.getContentAsString());
        assertTrue(json(saved).get("ok").asBoolean());

        JsonNode items = json(GET("/account/wishlist", session));
        assertEquals(1, items.size());
        assertEquals(handle, items.get(0).get("handle").asText());
    }

    @Test
    void loginRotatesSessionIdToPreventFixation() throws Exception {
        String creds = "{\"email\":\"rotate@ex.com\",\"password\":\"secret123\"}";
        POST("/account/register", creds);
        MockHttpSession session = new MockHttpSession();
        String before = session.getId();
        assertTrue(json(POST("/account/login", creds, session)).get("ok").asBoolean());
        String after = session.getId();
        assertNotEquals(before, after, "session id must change on authentication");
    }
}
