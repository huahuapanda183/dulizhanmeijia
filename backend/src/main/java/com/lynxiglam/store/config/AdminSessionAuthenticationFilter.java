package com.lynxiglam.store.config;

import com.lynxiglam.store.admin.AdminSession;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Bridges our lightweight HttpSession-based admin login onto Spring Security's
 * authorization model: if the session carries an {@code adminId}, populate the
 * SecurityContext with a ROLE_ADMIN authentication so {@code hasRole("ADMIN")}
 * rules apply. Read-only — it never creates a session.
 */
public class AdminSessionAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        Object adminId = session == null ? null : session.getAttribute(AdminSession.ID_ATTRIBUTE);
        // Runs after AnonymousAuthenticationFilter, so treat an anonymous token as "unauthenticated"
        // and upgrade it to ROLE_ADMIN when the session proves an admin login.
        if (adminId != null && isUnauthenticated(SecurityContextHolder.getContext().getAuthentication())) {
            Object email = session.getAttribute(AdminSession.EMAIL_ATTRIBUTE);
            var authentication = new UsernamePasswordAuthenticationToken(
                    email != null ? email : adminId,
                    null,
                    List.of(new SimpleGrantedAuthority(AdminSession.ROLE))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        chain.doFilter(request, response);
    }

    private static boolean isUnauthenticated(Authentication authentication) {
        return authentication == null
                || authentication instanceof AnonymousAuthenticationToken
                || !authentication.isAuthenticated();
    }
}
