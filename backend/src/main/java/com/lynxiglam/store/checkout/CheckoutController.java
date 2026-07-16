package com.lynxiglam.store.checkout;

import com.lynxiglam.store.common.dto.Dtos.OrderDto;
import com.lynxiglam.store.common.dto.Dtos.OrderInputDto;
import com.lynxiglam.store.common.dto.Dtos.PromoRequest;
import com.lynxiglam.store.common.dto.Dtos.PromoResultDto;
import com.lynxiglam.store.common.dto.Dtos.ShippingRateDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
public class CheckoutController {
    private final CheckoutService checkout;

    public CheckoutController(CheckoutService checkout) {
        this.checkout = checkout;
    }

    @GetMapping("/checkout/shipping-rates")
    List<ShippingRateDto> shippingRates(
            @RequestParam(defaultValue = "0") BigDecimal subtotal,
            // Reserved destination fields: rates are subtotal-only today, but the
            // contract accepts a destination so region-based rating can be added
            // without a breaking change. Existing subtotal-only calls still work.
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String zip
    ) {
        return checkout.shippingRates(subtotal, country, state, zip);
    }

    @PostMapping("/checkout/promo")
    PromoResultDto promo(@Valid @RequestBody PromoRequest request) {
        return checkout.promo(request.code(), request.subtotal());
    }

    @PostMapping("/orders")
    OrderDto createOrder(@Valid @RequestBody OrderInputDto input) {
        return checkout.createOrder(input);
    }
}
