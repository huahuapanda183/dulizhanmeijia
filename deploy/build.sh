#!/usr/bin/env bash
# Build BOTH artifacts on the Linux host into a timestamped release dir.
#
# RUNS ON THE SHARED HOST. `next build` and `mvn package` are the largest
# memory spikes in this entire deploy — larger than the services they produce.
# Swap=0 means an unbudgeted spike does not swap, it invokes the OOM killer,
# which picks by badness score and may well pick podsys. Every heavy step below
# runs inside a systemd scope with its own MemoryMax, so an overrun kills the
# BUILD and nothing else. This is the point of the script.
set -euo pipefail

SRC="${SRC:-/opt/lynxiglam/src}"
REL="/opt/lynxiglam/releases/$(date +%Y%m%dT%H%M%S)"
API_URL="https://lynxiglam.kejing.online/api"

command -v systemd-run >/dev/null || { echo "systemd-run required"; exit 1; }
cap() { systemd-run --scope --quiet -p MemoryMax="$1" -p MemorySwapMax=0 -p CPUQuota=400% -p CPUWeight=30 --slice=lynxiglam.slice -- "${@:2}"; }

mkdir -p "$REL/backend" "$REL/web"
cd "$SRC"
echo "== HEAD: $(git rev-parse --short HEAD)  clean: $(git status --porcelain | wc -l) files dirty"

# ---------- Backend ----------
echo "== Backend: mvnw package"
cap 2G ./mvnw --batch-mode -DskipTests clean package -f backend/pom.xml
cp backend/target/store-*.jar "$REL/backend/store.jar"

# ---------- Frontend ----------
# CLEAN BUILD IS MANDATORY. .next accumulates chunks across builds: a stale mock
# chunk surviving into a release is exactly the bug the mock-bake check exists to
# catch.
rm -rf .next node_modules/.cache

echo "== Frontend: npm ci"
cap 2G npm ci

# NEXT_PUBLIC_* IS INLINED AT BUILD TIME (src/lib/api/config.ts). It is baked
# into the JS at THIS moment; the systemd unit deliberately sets no
# NEXT_PUBLIC_* because doing so at runtime would have zero effect.
#
# PREREQUISITE: generateStaticParams() at src/app/collections/[handle]/page.tsx,
# src/app/pages/[slug]/page.tsx, src/app/blogs/news/[handle]/page.tsx and
# src/app/products/[handle]/page.tsx all CALL THE API. In api mode this build
# performs real HTTPS requests to ${API_URL}. The backend, nginx and TLS must
# ALREADY be live, and lynxiglam.kejing.online must resolve from this host
# (RUNBOOK step 14). If it does not, the build fails here — by design.
echo "== Preflight: is the API actually reachable from this host?"
curl -fsS -m 15 "${API_URL}/products/handles" >/dev/null \
  || { echo "FATAL: ${API_URL} unreachable. Do RUNBOOK steps 6-13 first."; exit 1; }

echo "== Frontend: next build (api mode)"
cap 2G env NEXT_PUBLIC_DATA_SOURCE=api NEXT_PUBLIC_API_URL="$API_URL" npx next build

# ---------- Assemble standalone ----------
# `output: "standalone"` (next.config.ts) does NOT copy these two. .next/standalone/
# contains neither public/ nor .next/static/. Without them the site serves
# unstyled HTML with broken images and no JS.
cp -a .next/standalone/. "$REL/web/"
mkdir -p "$REL/web/.next/static"
cp -a .next/static/. "$REL/web/.next/static/"
cp -a public "$REL/web/public"            # 137MB (123MB images + 14MB videos)
mkdir -p "$REL/web/.next/cache"           # must exist: ReadWritePaths= in the unit

# ---------- MOCK-BAKE PROOF ----------
# NOT a grep for mock strings. That check would be WRONG here: products.ts
# statically imports PRODUCTS from lib/data/catalog, so the mock catalog is
# bundled in BOTH modes and greps for it always hit.
# The real signal is the constant fold of usingMock() + the inlined base URL.
echo "== Verifying the bundle is not mock-baked"
BAD=$(grep -rl '"usingMock",0,function(){return true}' "$REL/web/.next" 2>/dev/null | wc -l)
GOOD=$(grep -rl '"usingMock",0,function(){return false}' "$REL/web/.next" 2>/dev/null | wc -l)
echo "   usingMock->true chunks : $BAD   (must be 0)"
echo "   usingMock->false chunks: $GOOD  (must be > 0)"
[ "$BAD" -eq 0 ]  || { echo "FATAL: MOCK-BAKED BUILD. Refusing."; exit 1; }
[ "$GOOD" -gt 0 ] || { echo "FATAL: no api-mode fold found — the minifier's output shape may have"
                       echo "       changed with the Next/Turbopack version. DO NOT weaken this"
                       echo "       check; re-derive the pattern and update it."; exit 1; }

grep -rq "$API_URL" "$REL/web/.next" \
  || { echo "FATAL: prod API URL not inlined."; exit 1; }
if grep -rl 'localhost:8090\|127.0.0.1:8090' "$REL/web/.next" 2>/dev/null | head -1; then
  echo "FATAL: a dev API URL is baked in (a stray .env.local was picked up)."; exit 1
fi
echo "   OK: api-mode, ${API_URL} inlined, no dev URL present."

chown -R root:root "$REL"
chmod -R go-w "$REL"

# Everything above is root-owned and go-w stripped, which is what we want for
# code. But .next must be WRITABLE BY THE SERVICE USER: ReadWritePaths= in the
# unit only lifts systemd's read-only bind mount — ordinary Unix permissions
# still apply, and the unit runs as lynxiglam-web with an empty
# CapabilityBoundingSet (no CAP_DAC_OVERRIDE to fall back on).
#
# Without this the ISR writes fail with EACCES instead of EROFS — same silent
# warn-loop, different errno. Scope it to the two trees Next actually writes:
# .next/server/app (app-router ISR pages) and .next/cache (fetch cache).
for d in "$REL/web/.next/server/app" "$REL/web/.next/cache"; do
  mkdir -p "$d"
  chown -R lynxiglam-web:lynxiglam-web "$d"
  chmod -R u+rwX,go-w "$d"
done

# Static assets must stay READABLE by nginx (www-data). `chmod -R go-w` above
# removes write bits but never re-adds read, so a build run under a umask of
# 077 would leave the release mode 0700 and nginx would 403 every asset —
# the site would render as unstyled HTML with broken images.
chmod -R a+rX "$REL/web/.next/static" "$REL/web/public"

echo "== Release staged at $REL"
echo "== Activate: ln -sfn $REL /opt/lynxiglam/current.new && mv -T /opt/lynxiglam/current.new /opt/lynxiglam/current"
