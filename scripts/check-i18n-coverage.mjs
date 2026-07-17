/**
 * Fails the build when a database-sourced string that is rendered through <T>/t()
 * has no zh translation.
 *
 * Why this exists: translate() (src/lib/i18n/messages.ts) uses the English string
 * itself as the dictionary key and falls back to `key` on a miss:
 *
 *     if (locale === "zh") return zh[key] ?? key;
 *
 * That fallback is silent. There is no way to distinguish "deliberately not
 * translated" from "someone edited the copy and the dictionary went stale" — the
 * page just renders English on a Chinese page, with no error anywhere. This
 * script makes that difference explicit and catches it in CI.
 *
 * Scope: ONLY strings that come from src/lib/data/* (i.e. are seeded into the
 * database) AND are actually wired to <T>. Static UI chrome lives in the
 * dictionary as its own source of truth and is not checked here. Product titles
 * are proper nouns ("La Perle", "Obsidian") and are deliberately rendered raw.
 *
 * Run: node --experimental-strip-types scripts/check-i18n-coverage.mjs
 */
import { zh } from "../src/lib/i18n/messages.ts";
import { COLLECTIONS, NAVIGATION } from "../src/lib/data/collections.ts";
import { PRODUCTS } from "../src/lib/data/catalog.ts";

/** Each entry documents WHERE the string is rendered, so a failure is actionable. */
const checks = [
  {
    label: "collections.title",
    renderedAt: "src/app/collections/[handle]/page.tsx:75,81",
    values: COLLECTIONS.map((c) => c.title),
  },
  {
    label: "collections.description",
    renderedAt: "src/app/collections/[handle]/page.tsx:84",
    values: COLLECTIONS.map((c) => c.description).filter(Boolean),
  },
  {
    label: "products.shape",
    renderedAt: "src/components/ProductCard.tsx:69, src/app/products/[handle]/page.tsx:59",
    values: PRODUCTS.map((p) => p.shape),
  },
  {
    label: "products.description",
    renderedAt: "src/app/products/[handle]/page.tsx:134",
    values: PRODUCTS.map((p) => p.description),
  },
  {
    label: "navigation.label",
    renderedAt: "src/components/SiteHeader.tsx:35",
    values: NAVIGATION.map((n) => n.label),
  },
];

let missingTotal = 0;
for (const { label, renderedAt, values } of checks) {
  const missing = [...new Set(values)].filter((v) => !(v in zh));
  if (missing.length === 0) continue;
  missingTotal += missing.length;
  console.error(`\n✗ ${label} — ${missing.length} string(s) with no zh translation`);
  console.error(`  rendered via <T> at: ${renderedAt}`);
  for (const m of missing) console.error(`    ${JSON.stringify(m)}`);
}

if (missingTotal > 0) {
  console.error(
    `\n${missingTotal} database-sourced string(s) would silently render in English on the` +
      `\nChinese site. Add them to MESSAGES.zh in src/lib/i18n/messages.ts.\n`,
  );
  process.exit(1);
}

console.log("i18n coverage: all database-sourced strings rendered via <T> have zh translations.");
