#!/usr/bin/env bash
# READ-ONLY proofs. Every documented safety property is asserted against the
# kernel/DB/network, not against the config file that requested it. A limit that
# was requested but not applied is worth less than no limit, because it is
# believed.
set -uo pipefail
PASS=0; FAIL=0
chk() { # chk "label" "expected" "actual"
  if [ "$2" = "$3" ]; then printf '  PASS %-52s %s\n' "$1" "$3"; PASS=$((PASS+1))
  else printf '  FAIL %-52s got=%s want=%s\n' "$1" "$3" "$2"; FAIL=$((FAIL+1)); fi
}

echo "=== 1. Memory caps ENFORCED (systemd's view) ==="
chk "api MemoryMax"   "1073741824" "$(systemctl show -p MemoryMax --value lynxiglam-api.service)"
chk "api MemoryHigh"  "939524096"  "$(systemctl show -p MemoryHigh --value lynxiglam-api.service)"
chk "web MemoryMax"   "536870912"  "$(systemctl show -p MemoryMax --value lynxiglam-web.service)"
chk "slice MemoryMax" "1677721600" "$(systemctl show -p MemoryMax --value lynxiglam.slice)"
systemctl show -p CPUQuotaPerSecUSec -p TasksMax -p MemorySwapMax lynxiglam-api.service

echo "=== 2. Memory caps ENFORCED (cgroup v2 — the kernel's own truth) ==="
# This is the authoritative one: systemd can report a value it failed to apply.
#
# Resolve the cgroup path from systemd instead of hardcoding it. Both units set
# Slice=lynxiglam.slice, so they live under /sys/fs/cgroup/lynxiglam.slice/,
# NOT system.slice/. The old hardcoded system.slice path never existed: `cat`
# failed, 2>/dev/null swallowed it, and this check — the ONLY kernel-level
# evidence behind "we cannot OOM the neighbours" — reported FAIL every single
# run. A check that always fails trains the operator to ignore the whole
# script, including section 7 (neighbour DB reachable), which is the one that
# actually matters.
cg() { echo "/sys/fs/cgroup$(systemctl show -p ControlGroup --value "$1" 2>/dev/null)"; }
API_CG=$(cg lynxiglam-api.service); WEB_CG=$(cg lynxiglam-web.service)
echo "  api cgroup: $API_CG"
echo "  web cgroup: $WEB_CG"
chk "api cgroup memory.max" "1073741824" "$(cat "$API_CG/memory.max" 2>/dev/null)"
chk "web cgroup memory.max" "536870912"  "$(cat "$WEB_CG/memory.max" 2>/dev/null)"
echo "  current usage:"
echo "    api $(( $(cat "$API_CG/memory.current" 2>/dev/null || echo 0) / 1048576 )) MiB / 1024"
echo "    web $(( $(cat "$WEB_CG/memory.current" 2>/dev/null || echo 0) / 1048576 )) MiB / 512"
echo "  OOM counters (must stay 0 — a non-zero 'oom_kill' means we hit the cap):"
grep -E '^(oom|oom_kill) ' "$API_CG/memory.events" 2>/dev/null | sed 's/^/    api /' || echo "    api memory.events unreadable"

echo "=== 3. -Xmx512m actually passed, and the JVM actually took it ==="
API_PID=$(systemctl show -p MainPID --value lynxiglam-api.service)
ps -o args= -p "$API_PID" | tr ' ' '\n' | grep -E '^-Xmx|^-XX:MaxMetaspaceSize' || echo "  !! heap flags MISSING"
# Independent of ps: the JVM prints its own effective ceiling (-Xlog:gc+init).
journalctl -u lynxiglam-api -b --no-pager | grep -i 'Heap Max Capacity' | tail -1

echo "=== 4. Loopback binding (NOT 0.0.0.0) ==="
ss -lntp | grep -E ':(3001|8090)\b' || echo "  !! not listening"
echo "  ^ MUST read 127.0.0.1:3001 and 127.0.0.1:8090."
echo "    0.0.0.0 on 3001 = the storefront is live on the public IP, bypassing"
echo "    TLS, security headers and EVERY rate limit."
PUB=$(curl -s -m 10 https://api.ipify.org)
for p in 3001 8090; do
  timeout 5 bash -c "</dev/tcp/${PUB}/${p}" 2>/dev/null \
    && echo "  !! FAIL: ${p} reachable on the public IP" || echo "  PASS: ${p} not public"
done

echo "=== 5. Active profile is prod (NOT dev/local — those seed a known-password admin) ==="
journalctl -u lynxiglam-api -b --no-pager | grep -i 'profile' | head -2
echo "  ^ MUST say: The following 1 profile is active: prod"

echo "=== 6. Swagger/OpenAPI closed ==="
for p in /api/v3/api-docs /api/swagger-ui.html /api/swagger-ui/index.html /api/actuator/health /api/actuator/env; do
  chk "GET $p" "404" "$(curl -s -o /dev/null -w '%{http_code}' -m 10 "https://lynxiglam.kejing.online$p")"
done

echo "=== 7. DB isolation — the neighbours' schemas are UNREACHABLE ==="
echo "  (enter the lynxiglam password when prompted)"
mysql -h 127.0.0.1 -u lynxiglam -p -e "SHOW DATABASES;"
echo "  ^ MUST list ONLY: information_schema, lynxiglam"
for db in podsys kejing kejing_staging test_kejing; do
  if mysql -h 127.0.0.1 -u lynxiglam -p -e "USE ${db};" 2>&1 | grep -q "ERROR 1044"; then
    echo "  PASS: ${db} denied (ERROR 1044)"
  else
    echo "  !!!! CATASTROPHIC: lynxiglam can reach ${db}. STOP EVERYTHING. Revoke now."
  fi
done
mysql --user=root -p -e "SHOW GRANTS FOR 'lynxiglam'@'127.0.0.1';"
echo "  ^ MUST be USAGE ON *.* plus lines ON \`lynxiglam\`.* ONLY."

echo "=== 8. Connection ceiling respected ==="
mysql --user=root -p -e "
  SELECT user, COUNT(*) conns FROM information_schema.processlist GROUP BY user ORDER BY conns DESC;
  SELECT user, host, max_user_connections FROM mysql.user WHERE user LIKE 'lynxiglam%';
  SHOW GLOBAL STATUS LIKE 'Threads_connected';
  SHOW GLOBAL STATUS LIKE 'Max_used_connections';
  SHOW GLOBAL STATUS LIKE 'Connection_errors_max_connections';"
echo "  ^ lynxiglam conns <= 8 (Hikari) and structurally <= 10 (MAX_USER_CONNECTIONS)."
echo "  ^ Connection_errors_max_connections must not have INCREASED since preflight."

echo "=== 9. Rate limits fire ==="
echo "  10 rapid POSTs to /api/account/login (expect 200/401 then 429):"
for i in $(seq 1 10); do
  curl -s -o /dev/null -w '%{http_code} ' -m 10 -X POST \
    -H 'Content-Type: application/json' \
    -d '{"email":"ratelimit-probe@example.invalid","password":"wrong-password-probe"}' \
    https://lynxiglam.kejing.online/api/account/login
done; echo
echo "  ^ 429 must appear. If it never does, the zones did not load — check that"
echo "    /etc/nginx/conf.d/lynxiglam-shared.conf is inside http {} (nginx -T)."
curl -s -m 10 -X POST -H 'Content-Type: application/json' -d '{}' \
  https://lynxiglam.kejing.online/api/account/login | head -c 200; echo
echo "  ^ a 429 body must be JSON, not HTML (src/lib/api/config.ts parses it)."

echo "=== 10. Security headers ==="
curl -sI -m 10 https://lynxiglam.kejing.online/ | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy|x-powered-by'
echo "  ^ X-Powered-By must be ABSENT (next.config.ts leaves poweredByHeader:true)."
# The old check curled /images/ (a DIRECTORY — always 403/404) and grepped for
# an HSTS header. Every header in the snippet carries `always`, so it is emitted
# on error responses too: the check returned 1 whether assets served or 404'd.
# It proved the header, never the asset. That matters because both alias
# locations combine `alias` with `try_files` — a classic nginx sharp edge whose
# failure mode is "every image and every JS/CSS chunk 404s", i.e. the site
# renders as unstyled HTML. Assert real files.
chk "GET /images/ (asset, 200)" "200" "$(curl -s -o /dev/null -w '%{http_code}' -m 10 https://lynxiglam.kejing.online/images/LaPerle_1.webp)"
chk "GET /_next/image is 404"   "404" "$(curl -s -o /dev/null -w '%{http_code}' -m 10 'https://lynxiglam.kejing.online/_next/image?url=%2Fimages%2FLaPerle_1.webp&w=3840&q=75')"
curl -sI -m 10 https://lynxiglam.kejing.online/images/LaPerle_1.webp | grep -ic 'strict-transport'
echo "  ^ must be 1: proves the header snippet was re-included in the alias"
echo "    locations. nginx add_header does not merge — a location with its own"
echo "    add_header silently drops all inherited ones."

echo "=== 11. Storefront is NOT mock-baked (runtime proof; version-independent) ==="
BEFORE=$(grep -c ' /api/' /var/log/nginx/lynxiglam.access.log 2>/dev/null || echo 0)
curl -s -o /dev/null -m 20 https://lynxiglam.kejing.online/collections/best-sellers
sleep 6   # access_log flush=5s
AFTER=$(grep -c ' /api/' /var/log/nginx/lynxiglam.access.log 2>/dev/null || echo 0)
echo "  /api/ hits in the access log: ${BEFORE} -> ${AFTER}"
[ "$AFTER" -gt "$BEFORE" ] \
  && echo "  PASS: SSR really queried the backend — the page is NOT mock-baked." \
  || echo "  !! FAIL: SSR rendered a collection page WITHOUT touching the API => MOCK-BAKED."
echo "  (Definitive alternative: stop lynxiglam-api and reload the page. An"
echo "   api-mode build errors; a mock-baked one renders products regardless.)"

echo "=== 12. Admin exists and /analytics is gated ==="
mysql -h 127.0.0.1 -u lynxiglam -p lynxiglam -e "SELECT id, email, role, active, created_at FROM admin_users;"
echo "  ^ must be >= 1 row, or /analytics is locked forever."
chk "GET /api/analytics unauthenticated" "401" \
    "$(curl -s -o /dev/null -w '%{http_code}' -m 10 https://lynxiglam.kejing.online/api/analytics)"

echo "=== 13. NEIGHBOURS UNHARMED (compare to the preflight baseline) ==="
for h in pod.kejing.online kejing.online www.kejing.online kejing.site kejing.duckdns.org; do
  printf '  %-24s -> %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' -m 10 "https://$h/" || echo FAIL)"
done
free -m | awk '/Mem:/{print "  MemAvailable now: " $7 " MB"}'
systemctl --failed --no-pager
echo "  ^ any co-tenant unit in --failed = investigate before going further."

echo; echo "=== ${PASS} passed, ${FAIL} failed ==="
[ "$FAIL" -eq 0 ] || echo "Do not declare success. Fix or roll back (RUNBOOK Rollback)."
