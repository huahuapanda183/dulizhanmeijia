// Single entry point for all data access. Components should import from here,
// never from the mock data modules directly. Swapping to a real backend only
// touches src/lib/api/* (see config.ts).
export * from "./products";
export * from "./collections";
export * from "./reviews";
export * from "./account";
export { API_CONFIG } from "./config";

import * as products from "./products";
import * as collections from "./collections";
import * as reviews from "./reviews";
import * as account from "./account";

export const api = {
  ...products,
  ...collections,
  ...reviews,
  ...account,
};
