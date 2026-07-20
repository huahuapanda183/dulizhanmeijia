package com.lynxiglam.store.common.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class Dtos {
    private Dtos() {}

    public record ProductDto(
            String id,
            String handle,
            String title,
            String shape,
            BigDecimal price,
            BigDecimal compareAtPrice,
            String currency,
            BigDecimal rating,
            long reviewCount,
            List<String> images,
            String hoverImage,
            String video,
            String badge,
            List<String> collections,
            String description,
            boolean available,
            List<String> tags,
            Instant createdAt
    ) {}

    public record CollectionDto(
            String handle,
            String title,
            String description,
            String image,
            List<String> products
    ) {}

    public record NavLinkDto(String label, String href) {}
    public record NavColumnDto(String heading, List<NavLinkDto> links) {}
    public record NavFeaturedDto(String label, String image, String href) {}
    public record NavItemDto(
            String label,
            String href,
            List<NavColumnDto> columns,
            List<NavFeaturedDto> featured
    ) {}

    public record ReviewDto(
            String id,
            String author,
            BigDecimal rating,
            String title,
            String body,
            String productHandle,
            String productTitle,
            String productImage,
            boolean verified,
            Instant createdAt
    ) {}

    public record PageSectionDto(String heading, List<String> body) {}
    public record FaqItemDto(String q, String a) {}
    public record PageDto(
            String slug,
            String title,
            String subtitle,
            List<PageSectionDto> sections,
            List<FaqItemDto> faq
    ) {}

    public record BlogPostDto(
            String handle,
            String title,
            String excerpt,
            String image,
            String author,
            Instant date,
            List<String> body
    ) {}

    public record FacetValueDto(String value, String label, long count) {}
    public record PriceRangeDto(BigDecimal min, BigDecimal max) {}
    public record ProductFacetsDto(
            List<FacetValueDto> shapes,
            List<FacetValueDto> tags,
            PriceRangeDto priceRange
    ) {}

    public record AddressDto(
            @NotBlank String firstName,
            @NotBlank String lastName,
            @Email @NotBlank String email,
            String phone,
            @NotBlank String line1,
            String line2,
            @NotBlank String city,
            @NotBlank String state,
            @NotBlank String zip,
            @NotBlank String country
    ) {}

    public record ShippingRateDto(
            String id,
            String label,
            BigDecimal amount,
            String estimate
    ) {}

    public record PromoRequest(@NotBlank String code, BigDecimal subtotal) {}
    public record PromoResultDto(boolean ok, String code, BigDecimal amount, String message) {}

    /**
     * @Max is not cosmetic: subtotal was accumulated in a 32-bit int, so an
     * unbounded quantity wrapped around — a real order for 2,387,420 units of a
     * $17.99 item was accepted and charged $12.84 (1799 * 2387420 mod 2^32).
     * 999 is far above any legitimate order and far below the wrap point.
     * CheckoutService also computes in long with overflow checks, so neither
     * control is load-bearing alone.
     */
    public record OrderLineInputDto(@NotBlank String handle, @Min(1) @Max(999) int quantity) {}
    public record OrderInputDto(
            // Bounded too: 200 lines x 999 each still cannot approach the overflow point.
            @NotEmpty @Size(max = 200) List<@Valid OrderLineInputDto> lines,
            @Email @NotBlank String email,
            @NotNull @Valid AddressDto shippingAddress,
            @NotBlank String shippingRateId,
            String promoCode,
            @NotBlank String idempotencyKey
    ) {}

    public record CartLineDto(
            String id,
            String handle,
            String title,
            String shape,
            String image,
            BigDecimal price,
            String currency,
            int quantity
    ) {}

    public record OrderDto(
            String id,
            String number,
            String email,
            List<CartLineDto> lines,
            BigDecimal subtotal,
            BigDecimal shipping,
            BigDecimal discount,
            BigDecimal tax,
            BigDecimal total,
            String currency,
            AddressDto shippingAddress,
            String status,
            Instant createdAt
    ) {}

    public record WishlistItemDto(String handle, Instant addedAt) {}
    public record SaveWishlistResult(boolean ok) {}

    public record ProductAnalyticsDto(
            String handle,
            String title,
            long views,
            long clicks,
            long adds
    ) {}

    public record AnalyticsSummaryDto(
            long totalViews,
            long totalClicks,
            long totalAdds,
            List<ProductAnalyticsDto> products
    ) {}

    public record TrackEventRequest(
            @NotBlank String type,
            @NotBlank String handle,
            @NotBlank String title
    ) {}

    public record AuthRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            String firstName,
            String lastName
    ) {}

    public record SubscribeRequest(String email, String phone, Boolean consent) {}
    public record ActionResultDto(boolean ok, String message) {}

    /** Whether the current session is an authenticated admin (for the admin UI gate). */
    public record AdminSessionDto(boolean authenticated, String email) {}

    public record ApiError(String code, String message, Map<String, String> fields, Instant timestamp) {}
}
