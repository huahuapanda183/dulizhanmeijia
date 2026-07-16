# LynxiGlam

A full-stack e-commerce storefront built as a technical exercise: a **Next.js 16** storefront + admin UI backed by a **Spring Boot 4 / Java 21** commerce API, wired together through a single typed data contract.

> **Status: local development.** Not deployed, and **not publicly deployable as-is** — see [Assets & attribution](#assets--attribution) and [Before any public deploy](#before-any-public-deploy).

## What's in it

- **Storefront** — home, collections with faceted filters (shape/type/price/stock) + sort, product detail with gallery & hover video, search, cart, wishlist, checkout + order confirmation, blog, info pages.
- **Admin** — dashboard, products, collections, orders, customers, and per-product analytics (views / clicks / add-to-cart).
- **i18n** — English / 简体中文 across storefront and admin.
- **Commerce API** — catalog, collections, content, reviews, checkout (shipping rates, promo codes, orders), account (register/login/wishlist/newsletter), analytics ingestion + reporting.

## Stack

| | |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4 |
| Backend | Java 21, Spring Boot 4, Spring MVC, JDBC, Spring Security, Flyway |
| Database | MySQL 8 (production) · in-memory H2 in MySQL mode (local dev/tests) |

## Layout

```
.                    # Next.js app (frontend)
├─ src/app/          # routes (storefront + /admin)
├─ src/components/   # UI components
├─ src/lib/api/      # THE data layer — every component reads data only from here
├─ src/lib/data/     # local mock data source
└─ backend/          # Spring Boot commerce API (com.lynxiglam.store)
   └─ src/main/resources/db/migration/   # Flyway schema + seed
docs/API_CONTRACT.md # REST contract the backend implements
```

## Quick start

### Frontend (works standalone — no backend needed)

```bash
npm install
npm run dev          # http://localhost:3000
```

Runs against the local mock data source by default, so the whole site is browsable with zero setup.

### Backend

Requires **JDK 21** (e.g. [Temurin](https://adoptium.net/)). Set `JAVA_HOME`, then:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev     # http://localhost:8090/api
```

The `dev` profile uses an in-memory H2 database seeded from the Flyway seed script — no MySQL required.

### Point the storefront at the backend

```bash
cp .env.local.example .env.local     # NEXT_PUBLIC_DATA_SOURCE=api
npm run dev
```

`NEXT_PUBLIC_*` values are **inlined at build time** — the data source is fixed when you build, not at runtime.

**Dev admin login** (dev/local profiles only, seeded by `AdminBootstrap`): `admin@lynxiglam.local` / `lynxiglam-admin`.

## Tests

```bash
npm run check                  # lint + typecheck + production build
cd backend && ./mvnw test      # 45 white-box tests
```

Backend tests run through MockMvc (in-process, no sockets) and cover money precision, catalog/facets, promo/shipping/tax, order totals + idempotency, concurrent duplicate orders, atomic analytics increments, auth/session, CORS, the error contract, and the JSON field contract against the TypeScript types.

## Architecture notes

- **One data contract.** Components import only from `src/lib/api`, which satisfies the `StoreApi` interface (`src/lib/api/contract.ts`). Swapping mock ↔ real API is an env var; no component changes. The mock implementation is checked against the contract at compile time via `satisfies StoreApi`.
- **Money is integer cents** in the database and `BigDecimal` major units on the wire. No float arithmetic on money server-side.
- **Orders are idempotent** — the client sends one UUID per checkout submission; a unique DB constraint makes retries (including concurrent ones) return the existing order instead of duplicating it.
- **Errors use one JSON envelope** (`{code, message, fields, timestamp}`). The frontend throws a typed `ApiError`; 404 maps to `null`, 401 means signed-out, and 5xx/network errors are never masked.
- **Payment is intentionally not integrated.** `orders.payment_intent_id` is reserved for a future processor.

See [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) for the full endpoint map.

## Assets & attribution

**The images, videos, product copy, reviews and page content in this repository are not original work.** They were extracted from [glamnetic.com](https://www.glamnetic.com/) while using this project to practice reverse-engineering a storefront. They remain the property of their respective owners and are **not covered by this repository's MIT license** — see [`NOTICE`](NOTICE).

The reviews, ratings, retailer/press logos, award badges and certification claims rendered by the app are **placeholder/sample data and are not genuine**.

This project was bootstrapped from [ai-website-clone-template](https://github.com/JCodesMore/ai-website-cloner-template) by JCodesMore (MIT).

## Before any public deploy

This runs locally today. It is **not** production-ready. Known blockers:

- Third-party assets and brand/trademark references must be replaced with owned or licensed material; the fabricated reviews and the unearned certification/award/retailer/press claims must be removed.
- The checkout renders card-number inputs that feed nothing — they must be removed before the site is publicly reachable.
- `/admin` has **no server-side authorization** (the client-side gate is UX only) — needs a `middleware.ts` guard.
- The default Spring profile is `local`; production must pin `prod` and provision its first admin deliberately.
- No rate limiting, no deployment automation (systemd/nginx/CI), and storefront routes are statically prerendered — in api mode they must opt into revalidation or prices go stale.
