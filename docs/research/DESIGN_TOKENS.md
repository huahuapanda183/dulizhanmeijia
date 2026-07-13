# Glamnetic — Design Tokens

## Colors (from getComputedStyle sampling)
| Token | Value | Usage |
|-------|-------|-------|
| cream | `#fbf6f3` (rgb 251,246,243) | Page background |
| cream-2 | `#f3f3f3` | Header bg, muted panels |
| white | `#ffffff` | Cards |
| mauve | `#b6637b` (rgb 182,99,123) | Primary brand accent, buttons, announcement bar |
| mauve-2 | `#be7489` | Button hover / tint |
| mauve-3 | `#c17a8f` | Borders on mauve elements |
| mauve-dark | `#a3506a` | Button active |
| ink | `#2d2d2c` (rgb 45,45,44) | Primary headings/text |
| ink-2 | `#1c1c1c` | Near-black emphasis |
| body | `#5c5c5c` (rgb 92,92,92) | Body/secondary text |
| line | `#dcdcdc` | Light borders/dividers |
| line-2 | `#e0e0df` | Card borders |
| burgundy | `#5c1a2b` | "Why Choose" banner bg (baked into image) |

All mapped in `globals.css` as `--color-*` Tailwind tokens → use `bg-cream`, `text-mauve`, `border-line`, etc.
shadcn tokens remapped: `--background:#fbf6f3`, `--foreground:#2d2d2c`, `--primary:#b6637b`, `--border:#dcdcdc`, `--radius:0.25rem`.

## Typography
- **Primary font:** `sofia-pro` (Adobe Typekit) on the live site → cloned with **Sofia Sans** (Google, `next/font`), var `--font-sofia`, exposed as `font-sans`/`font-heading`.
- Weights in use: 300 (logo "NETIC"), 400 (body), 500, 600, 700, 800 (logo "GLAM").
- Section headings ("OUR BEST SELLERS", "OUR REVIEWS", "SHOP US IRL"): uppercase, letter-spacing ≈ 0.18em, weight ~400–500, centered, ink color. Use `.heading-track` utility. Size ≈ 34–40px desktop.
- Product name: ~18–20px, ink, normal weight, centered. Shape subtitle: ~15px body gray. Price: ~15px ink.
- "ADD TO BAG": uppercase, letter-spaced, underlined text link, ink.
- Nav links: uppercase, ~13–14px, letter-spacing ≈ 0.08em, ink.

## Spacing / layout
- Section vertical padding ≈ 40–64px.
- Content max-width ≈ 1500px, side padding ≈ 20–40px.
- Product/card rails: horizontal scroll, gap ≈ 16–24px, 4 cards visible desktop.
- Border radius: small (≈ 4px) on inputs/cards; buttons mostly rectangular; pills fully rounded (announcement/promo pills).

## Buttons
- Primary (SHOP NOW / FIND US): mauve `#b6637b` bg, white uppercase letter-spaced text, rectangular, ~14px, padding ≈ 14px 32px.
- Text link (ADD TO BAG, Join Us ›): underlined, ink.
