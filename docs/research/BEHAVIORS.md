# Glamnetic — Behavior Bible

Interaction findings from the live-site sweep. No smooth-scroll library (Lenis/Locomotive) detected — native scroll.

## Header (sticky)
- CSS flags on live site: `--header-is-sticky: 1`, `--announcement-bar-is-sticky: 0`.
- **Announcement bar scrolls away** with the page (not sticky).
- **Header sticks** to the top once the announcement bar scrolls out. It does NOT shrink or restyle noticeably — same height/bg at scroll 0 and scrolled. Background: light cream/gray, subtle bottom border.
- Implementation: `position: sticky; top: 0; z-index: 50` on the header; announcement bar sits above in normal flow.

## Announcement bar
- Cycles multiple messages with ‹ › arrows; includes a live countdown (e.g. "7H 6M 41S").
- Implement: small client component with a setInterval countdown; arrows rotate through 2–3 messages.

## Hero slideshow
- 5 slides, **auto-advances** (time-driven, ~5s) with a fade/slide transition; **dot indicators** ("Go to item 1…5") below.
- Full-bleed banner images; desktop vs mobile use different image files.
- Client component: index state, interval, dots clickable.

## Product carousels (Best Sellers, Shop All)
- Horizontal rail, **arrow (‹ ›) click-driven**, 4 cards visible desktop. scroll-snap rail.
- Card **hover**: primary image swaps to a second lifestyle/hover image (e.g. CitrusCoast_1 → CitrusCoast_2), subtle. Rating badge (★X.X) pinned top-right of image. Some Shop-All cards show a "NEW" ribbon top-left and a compare-at strikethrough price.
- "ADD TO BAG" underline link under each card.

## Reviews carousel
- Horizontal rail of review cards, arrow-driven. Each: 5 pink stars, reviewer name, "Verified Buyer" badge (some), "N hours ago", small product thumbnail + product name, "5 Stars", short title (e.g. "Yas!", "Fabulous").

## Collection / promo card carousels
- Full-bleed image cards with a dark gradient bottom and white bottom-left label; horizontal rail.

## Category cards
- Full-bleed image cards, label overlaid bottom-left; on hover slight image zoom.

## Multi-column feature cards
- 2 tall image cards; underlined white label bottom-left; hover image zoom.

## Marquee ("AS SEEN ON")
- Infinite horizontal auto-scroll of press logos. Implement with duplicated logo track + CSS `@keyframes marquee` translateX(-50%) (already in globals.css as `.animate-marquee`).

## Responsive
- Desktop 1440: multi-column rails (4 products, 3–4 cards).
- Tablet ~768: rails reduce visible cards (2–3), category cards stack to 2.
- Mobile 390: single-column stacks; hero + banners swap to mobile image; nav collapses to hamburger only; rails become swipe (1.2 cards peek).
- Breakpoints ≈ 768px (tablet) and ≈ 990px (desktop), typical Shopify.
