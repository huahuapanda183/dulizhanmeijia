package com.lynxiglam.store.account;

import com.lynxiglam.store.common.dto.Dtos.ActionResultDto;
import com.lynxiglam.store.common.dto.Dtos.AuthRequest;
import com.lynxiglam.store.common.dto.Dtos.SaveWishlistResult;
import com.lynxiglam.store.common.dto.Dtos.SubscribeRequest;
import com.lynxiglam.store.common.dto.Dtos.WishlistItemDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class AccountController {
    private final AccountService accounts;

    public AccountController(AccountService accounts) {
        this.accounts = accounts;
    }

    @PostMapping("/account/register")
    ActionResultDto register(@Valid @RequestBody AuthRequest input) {
        return accounts.register(input);
    }

    @PostMapping("/account/login")
    ActionResultDto login(@Valid @RequestBody AuthRequest input, HttpServletRequest request) {
        var credentials = accounts.credentials(input.email());
        if (credentials.isEmpty() || !accounts.passwordMatches(input.password(), credentials.get().passwordHash())) {
            return new ActionResultDto(false, "Invalid email or password.");
        }
        HttpSession session = request.getSession(true);
        request.changeSessionId();
        session.setAttribute(CustomerSession.ID_ATTRIBUTE, credentials.get().id());
        return new ActionResultDto(true, "Signed in.");
    }

    @PostMapping("/newsletter/subscribe")
    ActionResultDto subscribe(@RequestBody SubscribeRequest input) {
        return accounts.subscribe(input);
    }

    @GetMapping("/account/wishlist")
    List<WishlistItemDto> wishlist(HttpSession session) {
        return accounts.wishlist(customerId(session));
    }

    @PutMapping("/account/wishlist")
    SaveWishlistResult saveWishlist(@RequestBody List<WishlistItemDto> items, HttpSession session) {
        accounts.saveWishlist(customerId(session), items);
        return new SaveWishlistResult(true);
    }

    private String customerId(HttpSession session) {
        Object customerId = session.getAttribute(CustomerSession.ID_ATTRIBUTE);
        if (customerId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required.");
        return customerId.toString();
    }
}
