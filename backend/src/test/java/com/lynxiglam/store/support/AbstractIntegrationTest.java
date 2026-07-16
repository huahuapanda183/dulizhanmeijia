package com.lynxiglam.store.support;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

/**
 * Full-stack web-layer tests driven through MockMvc (in-process DispatcherServlet
 * + the real Spring Security filter chain, JSON serialization, and exception
 * handling) — no network sockets, which this host's NIO stack cannot open.
 *
 * The H2 database is dropped, recreated from the H2 schema, re-seeded, and given
 * a known admin before every test, so tests are order-independent.
 */
@SpringBootTest
@AutoConfigureMockMvc
public abstract class AbstractIntegrationTest {
    protected static final String ADMIN_EMAIL = "admin@itest.local";
    protected static final String ADMIN_PASSWORD = "itest-admin-pass";

    @Autowired
    protected MockMvc mvc;

    @Autowired
    protected ObjectMapper mapper;

    @Autowired
    protected DataSource dataSource;

    @Autowired
    protected JdbcTemplate jdbc;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @BeforeEach
    void resetDatabase() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ByteArrayResource("DROP ALL OBJECTS;".getBytes(StandardCharsets.UTF_8)));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/dev/schema-h2.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/migration/V2__seed.sql"));
        }
        jdbc.update(
                "INSERT INTO admin_users (id, email, password_hash, role) VALUES (?, ?, ?, 'ADMIN')",
                UUID.randomUUID().toString(), ADMIN_EMAIL, passwordEncoder.encode(ADMIN_PASSWORD)
        );
    }

    // ---- request helpers (paths are relative to the context-path, e.g. "/products") ----

    protected MockHttpServletResponse GET(String path) throws Exception {
        return mvc.perform(get(path)).andReturn().getResponse();
    }

    protected MockHttpServletResponse GET(String path, MockHttpSession session) throws Exception {
        return mvc.perform(get(path).session(session)).andReturn().getResponse();
    }

    protected MockHttpServletResponse POST(String path, String body) throws Exception {
        return mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(body)).andReturn().getResponse();
    }

    protected MockHttpServletResponse POST(String path, String body, MockHttpSession session) throws Exception {
        return mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(body).session(session))
                .andReturn().getResponse();
    }

    protected MockHttpServletResponse PUT(String path, String body, MockHttpSession session) throws Exception {
        return mvc.perform(put(path).contentType(MediaType.APPLICATION_JSON).content(body).session(session))
                .andReturn().getResponse();
    }

    protected JsonNode json(MockHttpServletResponse response) throws Exception {
        return mapper.readTree(response.getContentAsString());
    }

    protected JsonNode getJson(String path) throws Exception {
        MockHttpServletResponse response = GET(path);
        assertTrue(response.getStatus() == 200, "GET " + path + " -> " + response.getStatus() + " " + response.getContentAsString());
        return json(response);
    }

    protected MockHttpSession loginAsAdmin() throws Exception {
        MockHttpSession session = new MockHttpSession();
        MockHttpServletResponse response = POST("/admin/login",
                "{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"" + ADMIN_PASSWORD + "\"}", session);
        assertTrue(response.getContentAsString().contains("\"ok\":true"),
                "admin login should succeed: " + response.getContentAsString());
        return session;
    }

    protected MockHttpSession loginAsCustomer(String email, String password) throws Exception {
        POST("/account/register", "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
        MockHttpSession session = new MockHttpSession();
        MockHttpServletResponse response = POST("/account/login",
                "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}", session);
        assertNotNull(response);
        return session;
    }
}
