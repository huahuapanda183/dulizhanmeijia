# Glamnetic Homepage — Page Topology

Target: https://www.glamnetic.com/ · Desktop page height ≈ 7222px · Platform: Shopify

Top-to-bottom sections (flow order). All are flow content except the header.

| # | Component | Interaction | Notes |
|---|-----------|-------------|-------|
| 0 | `AnnouncementBar` | time-driven | Mauve bar, centered free-shipping text + live countdown, ‹ › arrows cycling messages |
| 1 | `SiteHeader` | scroll (sticky) | Sticky top. Row 1: hamburger ∙ GLAMNETIC wordmark (center) ∙ account/search/bag. Row 2: nav (SHOP ALL, GLUE-ON NAILS, QUICK PRESS MANI, LASHES, BUNDLES, LOYALTY). Light cream/gray bg |
| 2 | `HeroSlideshow` | time-driven | 5 full-bleed banner slides, auto-advance, dot nav. Desktop + mobile image per slide |
| 3 | `CategoryCards` | static (hover) | 4 full-bleed image cards, label overlaid bottom-left (SHOP GLUE ON NAILS / QUICK PRESS MANI / ACCESSORIES / LASHES) |
| 4 | `BestSellers` | click (carousel) | "OUR BEST SELLERS" + horizontal product rail, ‹ › arrows. 8 products |
| 5 | `WhyChoose` | static | Single full-width burgundy banner image (badges_desktop / badges_mobile) |
| 6 | `Reviews` | click (carousel) | "OUR REVIEWS" + review-card rail. Star rating, name, verified, time-ago, product thumb, title |
| 7 | `ShopAllPressOns` | click (carousel) | "Shop All Press-On Nails" + product rail. 8 products; some NEW badge + compare-at price |
| 8 | `CollectionCards` | click (carousel) | Promo image cards w/ bottom-left labels (Free Shipping, Sparkling Gems, Sandal Season, …) |
| 9 | `ShopIRL` | static | Peach band. Hands image left, "SHOP US IRL" heading + mauve FIND US button |
| 10 | `RetailerLogos` | static | Row of retailer logos: Ulta, Sephora, Ulta at Target, Kohl's + Sephora |
| 11 | `MultiColumn` | static (hover) | 2 tall image cards: "Join Our Membership Program", "Join the GlamFam Community", underlined labels bottom-left |
| 12 | `Marquee` | time-driven | "AS SEEN ON" + infinite horizontal scroll of 12 press logos |
| 13 | `SiteFooter` | static | VIP newsletter (email + phone + consent), Brand/Social/Customer Service link columns, app-store badges, legal bar with wordmark |

Floating (fixed overlay): third-party "Shop with AI" pill (bottom-right) + accessibility widget (bottom-left) — rendered as static, non-functional decorations.

## Page layout
- Single vertical scroll, native (no Lenis/Locomotive detected).
- Full-bleed sections (100vw) with inner content max-width ≈ 1500px for text/rails.
- Sticky header overlays content; z-index header above sections.
