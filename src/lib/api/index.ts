// Single entry point for all data access. Components should import from here,
// never from the mock data modules directly. Swapping to a real backend only
// touches src/lib/api/* (see config.ts).
export * from "./products";
export * from "./collections";
export * from "./reviews";
export * from "./account";
export * from "./content";
export * from "./checkout";
export * from "./wishlist";
export * from "./analytics";
export { API_CONFIG } from "./config";

import * as products from "./products";
import * as collections from "./collections";
import * as reviews from "./reviews";
import * as account from "./account";
import * as content from "./content";
import * as checkout from "./checkout";
import * as wishlist from "./wishlist";
import * as analytics from "./analytics";
import type { StoreApi } from "./contract";

export type { StoreApi } from "./contract";

// `satisfies StoreApi` is a compile-time guarantee that the (mock) implementation
// stays in sync with the backend contract. If you add a method to StoreApi and
// forget to implement it, the build fails here.
export const api = {
  ...products,
  ...collections,
  ...reviews,
  ...account,
  ...content,
  ...checkout,
  ...wishlist,
  ...analytics,
} satisfies StoreApi;
