# Glamnetic Homepage — Pixel-Perfect Clone

A faithful, responsive rebuild of the [glamnetic.com](https://www.glamnetic.com/) homepage in a clean, modern Next.js codebase. Reverse-engineered section-by-section with real extracted assets, design tokens, and content.

## Tech Stack
- **Next.js 16** (App Router, React 19, TypeScript strict)
- **Tailwind CSS v4** with Glamnetic design tokens (hex custom properties)
- **Sofia Sans** (`next/font`) — open-source stand-in for the site's Adobe `sofia-pro`
- Static, fully client-renderable — no backend

## Sections (14)
Announcement bar (live countdown) · sticky header + nav · 5-slide auto hero · category cards · Best Sellers carousel · "Why Choose" banner · reviews · Shop All Press-Ons carousel · collection promo cards · "Shop Us IRL" · retailer logos · membership / GlamFam cards · "As Seen On" marquee · footer.

## Getting Started
```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run check` — lint + typecheck + build (all green)
- `node scripts/download-assets.mjs` — re-download source assets listed in `scripts/asset-urls.txt`

## Project Structure
```
src/
  app/            # layout.tsx (fonts, metadata), globals.css (tokens), page.tsx (assembly)
  components/     # 14 section components + shared (CarouselRail, ProductCard, icons)
  types/          # content interfaces
public/
  images/         # 114 real images downloaded from the source site
  fonts/          # 8 self-hosted font files
docs/research/    # PAGE_TOPOLOGY, DESIGN_TOKENS, BEHAVIORS, CONTENT_MAP
```

## Notes
- **Colors:** cream `#fbf6f3`, brand mauve `#b6637b`, ink `#2d2d2c` (extracted via `getComputedStyle`).
- **Reviews** are representative cards matching the live ones (the site loads reviews from a third-party widget).
- Links to `/collections/*`, `/products/*`, `/pages/*` are decorative (this is a homepage-only clone).
- Fully responsive: mobile hero image variants, hamburger drawer, stacked layouts, swipe rails. Verified at 375px and 1440px.
