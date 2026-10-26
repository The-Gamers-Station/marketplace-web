package com.thegamersstation.marketplace.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.DefaultCorsProcessor;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SecurityConfigCorsTests {

    private static final String ADMIN_ORIGIN = "https://marketplace-admin-ejc.pages.dev";

    private CorsConfiguration configuration(MockHttpServletRequest request) {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        return config.corsConfigurationSource().getCorsConfiguration(request);
    }

    private MockHttpServletRequest preflight(String origin, String method) {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/auth/otp/request");
        request.addHeader("Origin", origin);
        request.addHeader("Access-Control-Request-Method", method);
        request.addHeader("Access-Control-Request-Headers", "content-type,authorization");
        return request;
    }

    @Test
    void allowsAdminLoginPreflightWithExactOrigin() throws IOException {
        MockHttpServletRequest request = preflight(ADMIN_ORIGIN, "POST");
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertTrue(new DefaultCorsProcessor().processRequest(configuration(request), request, response));
        assertEquals(200, response.getStatus());
        assertEquals(ADMIN_ORIGIN, response.getHeader("Access-Control-Allow-Origin"));
        assertEquals("true", response.getHeader("Access-Control-Allow-Credentials"));
        assertTrue(response.getHeader("Access-Control-Allow-Methods").contains("POST"));
        assertTrue(response.getHeader("Access-Control-Allow-Headers").toLowerCase().contains("authorization"));
    }

    @Test
    void rejectsUnrelatedAndLookalikeOrigins() throws IOException {
        for (String origin : new String[] {
                "https://another-project.pages.dev",
                "https://marketplace-admin-ejc.pages.dev.attacker.example",
                "http://marketplace-admin-ejc.pages.dev"
        }) {
            MockHttpServletRequest request = preflight(origin, "POST");
            MockHttpServletResponse response = new MockHttpServletResponse();

            assertFalse(new DefaultCorsProcessor().processRequest(configuration(request), request, response));
            assertEquals(403, response.getStatus());
            assertNull(response.getHeader("Access-Control-Allow-Origin"));
        }
    }

    @Test
    void preservesMarketplaceOriginsAndRejectsUnsupportedMethods() throws IOException {
        MockHttpServletRequest request = preflight(ADMIN_ORIGIN, "TRACE");
        CorsConfiguration cors = configuration(request);
        assertNotNull(cors);
        assertEquals("https://gamers-station.com", cors.checkOrigin("https://gamers-station.com"));
        assertEquals("https://www.gamers-station.com", cors.checkOrigin("https://www.gamers-station.com"));

        MockHttpServletResponse response = new MockHttpServletResponse();
        assertFalse(new DefaultCorsProcessor().processRequest(cors, request, response));
        assertEquals(403, response.getStatus());
    }
}
