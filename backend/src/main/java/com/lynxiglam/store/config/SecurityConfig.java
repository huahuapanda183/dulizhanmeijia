package com.lynxiglam.store.config;

import com.lynxiglam.store.common.dto.Dtos.ApiError;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Configuration
public class SecurityConfig {

    // Public, unauthenticated storefront reads.
    private static final String[] PUBLIC_GETS = {
            "/products/**", "/collections/**", "/navigation", "/reviews/**", "/pages/**", "/blog/**"
    };
    // Public writes the storefront performs without a login (guarded per-request where needed).
    private static final String[] PUBLIC_POSTS = {
            "/checkout/promo", "/newsletter/subscribe", "/account/login", "/account/register",
            "/account/wishlist", "/analytics/events", "/orders", "/admin/login", "/admin/logout"
    };

    private final ObjectMapper objectMapper;

    public SecurityConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.ignoringRequestMatchers(PUBLIC_POSTS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_GETS).permitAll()
                        .requestMatchers(HttpMethod.GET, "/checkout/shipping-rates").permitAll()
                        .requestMatchers(HttpMethod.POST, PUBLIC_POSTS).permitAll()
                        .requestMatchers(HttpMethod.PUT, "/account/wishlist").permitAll()
                        .requestMatchers(HttpMethod.GET, "/account/wishlist").permitAll()
                        .requestMatchers(HttpMethod.GET, "/admin/session").permitAll()
                        // Analytics reporting is admin-only; event ingestion (POST) stays public above.
                        .requestMatchers(HttpMethod.GET, "/analytics").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new AdminSessionAuthenticationFilter(), AuthorizationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jsonAuthenticationEntryPoint())
                        .accessDeniedHandler(jsonAccessDeniedHandler())
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());
        return http.build();
    }

    private AuthenticationEntryPoint jsonAuthenticationEntryPoint() {
        return (request, response, authException) ->
                writeError(response, HttpStatus.UNAUTHORIZED, "unauthorized", "Admin sign-in required.");
    }

    private AccessDeniedHandler jsonAccessDeniedHandler() {
        return (request, response, deniedException) ->
                writeError(response, HttpStatus.FORBIDDEN, "forbidden", "You do not have access to this resource.");
    }

    private void writeError(jakarta.servlet.http.HttpServletResponse response, HttpStatus status, String code, String message)
            throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(
                new ApiError(code, message, Map.of(), Instant.now())
        ));
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.storefront-origin}") String storefrontOrigin
    ) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(storefrontOrigin));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
