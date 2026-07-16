package com.lynxiglam.store.admin;

import com.lynxiglam.store.common.dto.Dtos.ActionResultDto;
import com.lynxiglam.store.common.dto.Dtos.AdminSessionDto;
import com.lynxiglam.store.common.dto.Dtos.AuthRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Session-based admin authentication. Deliberately mirrors the customer auth
 * shape (email + password → server session) so the storefront and admin UIs
 * behave consistently. The analytics reporting endpoint and any future admin
 * APIs are gated on the {@code ROLE_ADMIN} authority this establishes.
 */
@RestController
public class AdminController {
    private final AdminService admins;

    public AdminController(AdminService admins) {
        this.admins = admins;
    }

    @PostMapping("/admin/login")
    ActionResultDto login(@Valid @RequestBody AuthRequest input, HttpServletRequest request) {
        var admin = admins.findByEmail(input.email());
        if (admin.isEmpty() || !admins.passwordMatches(input.password(), admin.get().passwordHash())) {
            return new ActionResultDto(false, "Invalid admin credentials.");
        }
        HttpSession session = request.getSession(true);
        request.changeSessionId();
        session.setAttribute(AdminSession.ID_ATTRIBUTE, admin.get().id());
        session.setAttribute(AdminSession.EMAIL_ATTRIBUTE, admin.get().email());
        return new ActionResultDto(true, "Signed in.");
    }

    @PostMapping("/admin/logout")
    ActionResultDto logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return new ActionResultDto(true, "Signed out.");
    }

    @GetMapping("/admin/session")
    AdminSessionDto session(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object id = session == null ? null : session.getAttribute(AdminSession.ID_ATTRIBUTE);
        if (id == null) return new AdminSessionDto(false, null);
        return new AdminSessionDto(true, (String) session.getAttribute(AdminSession.EMAIL_ATTRIBUTE));
    }
}
