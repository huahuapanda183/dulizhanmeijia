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
| GET | `/checkout/shipping-rates` | `subtotal` | `ShippingRate[]` |
| POST | `/checkout/promo` | `{ code, subtotal }` | `PromoResult` |
| POST | `/orders` | `OrderInput` | `Order` |

## Account
| POST | `/account/login` | `{ email, password }` | `ActionResult` |
| POST | `/account/register` | `{ email, password, firstName?, lastName? }` | `ActionResult` |
| POST | `/newsletter/subscribe` | `{ email?, phone?, consent? }` | `ActionResult` |
| GET | `/account/wishlist` | — | `WishlistItem[]` |
| PUT | `/account/wishlist` | `WishlistItem[]` | `{ ok: boolean }` |

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
`apiFetch` throws on non-2xx. List/detail getters that can 404 (`getProduct`,
`getCollection`, `getPage`, `getBlogPost`) catch and return `null`. Mutations
(`createOrder`, `applyPromoCode`, auth) return a typed result object so the UI
can show a message rather than throwing.
