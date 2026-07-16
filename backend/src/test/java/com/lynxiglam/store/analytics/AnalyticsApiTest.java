package com.lynxiglam.store.analytics;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AnalyticsApiTest extends AbstractIntegrationTest {

    private String someHandle() throws Exception {
        return getJson("/products").get(0).get("handle").asText();
    }

    private MockHttpServletResponse track(String type, String handle) throws Exception {
        return POST("/analytics/events", "{\"type\":\"" + type + "\",\"handle\":\"" + handle + "\",\"title\":\"T\"}");
    }

    @Test
    void trackReturns204() throws Exception {
        assertEquals(204, track("view", someHandle()).getStatus());
    }

    @Test
    void unknownHandleIs404AndBadTypeIs400() throws Exception {
        assertEquals(404, track("view", "__ghost__").getStatus());
        assertEquals(400, track("teleport", someHandle()).getStatus());
    }

    @Test
    void analyticsReportIsAdminOnly() throws Exception {
        MockHttpServletResponse anon = GET("/analytics");
        assertEquals(401, anon.getStatus());
        assertEquals("unauthorized", json(anon).get("code").asText());

        MockHttpSession admin = loginAsAdmin();
        assertEquals(200, GET("/analytics", admin).getStatus());
    }
}
