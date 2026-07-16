# Storefront API Contract

The frontend talks to data **only** through `src/lib/api/*`, which conforms to the
`StoreApi` interface (`src/lib/api/contract.ts`). Today those functions read from
the local mock (`src/lib/data/*`). To connect a backend, implement these REST
endpoints and set:

```
NEXT_PUBLIC_DATA_SOURCE=api
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Each `api/*.ts` module already has the `if (!usingMock()) { ... apiFetch(...) }`
branch pointing at the paths below — you implement the server side, no component
changes required. All responses are JSON. Money is a number in major units
(e.g. `21.99`) plus a `currency` code.

## Catalog
| Method | Path | Query / Body | Returns |
|---|---|---|---|
| GET | `/products` | `collection, search, sort, shapes[], tags[], priceMin, priceMax, inStock, page, pageSize, limit` | `Product[]` |
| GET | `/products/:handle` | — | `Product` |
| GET | `/products/batch` | `handle=a&handle=b` | `Product[]` |
| GET | `/products/facets` | `collection, search` | `ProductFacets` |
| GET | `/products/:handle/recommendations` | `limit` | `Product[]` |
| GET | `/products/handles` | — | `string[]` |

## Collections & navigation
| GET | `/collections` | — | `Collection[]` |
| GET | `/collections/:handle` | — | `Collection` |
| GET | `/collections/handles` | — | `string[]` |
| GET | `/navigation` | — | `NavItem[]` |

## Reviews
| GET | `/reviews` | `product` (optional) | `Review[]` |

## Content
| GET | `/pages/:slug` | — | `Page` |
| GET | `/pages/slugs` | — | `string[]` |
| GET | `/blog` | — | `BlogPost[]` |
| GET | `/blog/:handle` | — | `BlogPost` |

## Checkout & orders
| GET | `/checkout/shipping-rates` | `subtotal`, `country?`, `state?`, `zip?` (destination reserved for region rating) | `ShippingRate[]` |
| POST | `/checkout/promo` | `{ code, subtotal }` | `PromoResult` |
| POST | `/orders` | `OrderInput` (required `idempotencyKey`) | `Order` |

## Account
| POST | `/account/login` | `{ email, password }` | `ActionResult` (starts a customer session) |
| POST | `/account/register` | `{ email, password, firstName?, lastName? }` | `ActionResult` |
| POST | `/newsletter/subscribe` | `{ email?, phone?, consent? }` | `ActionResult` |
| GET | `/account/wishlist` | — (requires customer session) | `WishlistItem[]` / `401` |
| PUT | `/account/wishlist` | `WishlistItem[]` (requires customer session) | `{ ok: boolean }` / `401` |

## Analytics (per-product click / view tracking)
| Method | Path | Query / Body | Returns |
|---|---|---|---|
| POST | `/analytics/events` | `{ type: "view" \| "click" \| "add", handle, title }` | `204 No Content` |
| GET | `/analytics` | — (**requires admin session**) | `AnalyticsSummary` / `401` |

`POST /analytics/events` is fire-and-forget: it atomically increments the daily
per-product counter and returns `204` with no body. An unknown `handle` is `404`;
an unknown `type` is `400`.

## Admin authentication (admin-only, not part of `StoreApi`)
Implemented in `src/lib/api/admin.ts` (kept out of the storefront contract). Used
to gate `GET /analytics` and any future admin APIs.
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/admin/login` | `{ email, password }` | `{ ok, message }` (starts an admin session) |
| POST | `/admin/logout` | — | `{ ok, message }` |
| GET | `/admin/session` | — | `{ authenticated: boolean, email? }` |

## Types
All request/response shapes are defined in `src/lib/data/types.ts`
(`Product`, `Collection`, `NavItem`, `Review`, `Page`, `BlogPost`,
`ProductFacets`, `ShippingRate`, `PromoResult`, `Order`, `OrderInput`,
`Address`, `WishlistItem`) and `src/lib/api/{reviews,account}.ts`
(`ReviewSummary`, `ActionResult`, `AuthInput`, `SubscribeInput`).

## Client-side state (not backend-owned yet)
- **Cart** — `src/lib/cart/cart-context.tsx` (localStorage). A backend cart would
  sync on mutate; the `createOrder` call already sends the line items.
- **Wishlist** — `src/lib/wishlist/wishlist-context.tsx` (localStorage). Sync
  point marked in the persist effect → `saveWishlist(items)` / `getWishlist()`.

## Error handling
Every non-2xx response uses one uniform JSON envelope (never an HTML error page or
a stack trace):

```json
{ "code": "not_found", "message": "…", "fields": { "field": "reason" }, "timestamp": "…" }
```

`apiFetch` throws a typed `ApiError` (`src/lib/api/config.ts`) carrying `status`,
`code`, and the parsed `body`. Callers branch on it precisely:

- List/detail getters that can 404 (`getProduct`, `getCollection`, `getPage`,
  `getBlogPost`) return `null` **only** for `ApiError.isNotFound` (status 404) and
  re-throw everything else — a 5xx or network failure is never masked as "missing".
- `getWishlist` / `saveWishlist` treat `401` as "not signed in" (return empty /
  `{ ok: false }`) and re-throw other failures.
- Mutations (`createOrder`, `applyPromoCode`, auth) return a typed result object so
  the UI can show a message rather than throwing.

Status codes: `400` validation (`fields` populated), `401` unauthorized,
`404` not found, `409` conflict, `500` `internal_error` (opaque message).

`POST /orders` is idempotent. The frontend generates one UUID per checkout
submission and reuses it for retries; the backend persists it under a unique
database constraint and returns the existing order when the key is repeated
(including under concurrent submission).
