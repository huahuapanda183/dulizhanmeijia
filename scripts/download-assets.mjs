// Downloads all Glamnetic assets listed in scripts/asset-urls.txt
// Images -> public/images, fonts -> public/fonts. Batched via curl (Cloudflare
// blocks Node's global fetch on this CDN, so we shell out to curl).
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, "..");
const IMG_DIR = path.join(ROOT, "public", "images");
const FONT_DIR = path.join(ROOT, "public", "fonts");
mkdirSync(IMG_DIR, { recursive: true });
mkdirSync(FONT_DIR, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const urls = readFileSync(path.join(ROOT, "scripts", "asset-urls.txt"), "utf8")
  .split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

const isFont = (u) => /\.(woff2?|ttf|otf)$/i.test(u);
const destFor = (u) => {
  const base = decodeURIComponent(u.split("/").pop().split("?")[0]);
  return path.join(isFont(u) ? FONT_DIR : IMG_DIR, base);
};

let ok = 0, skip = 0, fail = 0;
const failures = [];

async function download(url) {
  const dest = destFor(url);
  if (existsSync(dest)) { skip++; return; }
  try {
    await run("curl", ["-sfL", "-A", UA, "-o", dest, url]);
    ok++;
  } catch (e) { fail++; failures.push(`${url} -> ${e.message}`); }
}

async function main() {
  const BATCH = 6;
  for (let i = 0; i < urls.length; i += BATCH) {
    await Promise.all(urls.slice(i, i + BATCH).map(download));
    process.stdout.write(`\r  ok ${ok} | skip ${skip} | fail ${fail}  (${Math.min(i + BATCH, urls.length)}/${urls.length})`);
  }
  console.log(`\nDone. ok=${ok} skip=${skip} fail=${fail}`);
  if (failures.length) console.log("Failures:\n" + failures.join("\n"));
}
main();
