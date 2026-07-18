#!/usr/bin/env bash
# READ-ONLY. Changes nothing. Run BEFORE any deploy step and BEFORE re-running
# one after a gap.
#
# Why re-measure: the recorded numbers say max_connections=300 with
# Max_used_connections=301 — the ceiling was ALREADY EXCEEDED at least once.
# Those figures are a snapshot from a past recon, not a fact about right now.
# Adding a 4th tenant on the strength of a stale reading is how a shared box
# gets an outage.
set -uo pipefail
FAIL=0
say() { printf '\n=== %s ===\n' "$*"; }
bad() { printf '  !! %s\n' "$*"; FAIL=1; }
ok()  { printf '  ok %s\n' "$*"; }

say "Host"
uname -a; lsb_release -d 2>/dev/null; nproc; uptime

say "Memory (Swap MUST be 0 -> no safety net; OOM kill is immediate)"
free -m
swapon --show || echo "  (no swap — as documented)"
MEM_AVAIL=$(awk '/MemAvailable/{print int($2/1024)}' /proc/meminfo)
echo "  MemAvailable: ${MEM_AVAIL} MB"
# Gate: 1.6G slice + ~2G build headroom + margin.
if [ "$MEM_AVAIL" -lt 4096 ]; then
  bad "MemAvailable ${MEM_AVAIL}MB < 4096MB. STOP. Do not deploy. Ask the user."
else ok "memory headroom sufficient (need >= 4096MB)"; fi

say "Top memory consumers (context: mysqld RSS ~26GB is the InnoDB buffer pool — expected, not a leak)"
ps -eo pid,user,rss,comm --sort=-rss | head -12

say "MySQL connection headroom  [needs an admin credential]"
mysql --user=root -p -e "
  SHOW GLOBAL VARIABLES LIKE 'max_connections';
  SHOW GLOBAL STATUS    LIKE 'Threads_connected';
  SHOW GLOBAL STATUS    LIKE 'Max_used_connections';
  SHOW GLOBAL STATUS    LIKE 'Max_used_connections_time';
  -- The smoking gun. If > 0, this server has ALREADY REFUSED connections.
  -- Any non-zero value means a 4th tenant is a decision, not a formality:
  -- STOP and put the number in front of the user before continuing.
  SHOW GLOBAL STATUS    LIKE 'Connection_errors_max_connections';
  SELECT user, COUNT(*) AS conns FROM information_schema.processlist
    GROUP BY user ORDER BY conns DESC;"
echo "  GATE: (max_connections - Threads_connected) must be >= 40."
echo "  GATE: Connection_errors_max_connections must be 0, or you must have"
echo "        explicit authorization to proceed anyway."

say "Ports 3001 / 8090 must be FREE (known tenants: 10000, 8000, 18080, 18000)"
if ss -lntp 2>/dev/null | grep -E ':(3001|8090)\b'; then
  bad "port already in use — pick another port; do NOT evict the occupant"
else ok "3001 and 8090 free"; fi

say "Disk (shared with podsys/MinIO/Docker; ~137MB assets + node_modules + backups)"
df -h /opt /var /var/backups /var/log 2>/dev/null

say "Toolchain"
node -v 2>/dev/null || bad "node missing"
nginx -v 2>&1 || bad "nginx missing"
java -version 2>&1 || echo "  (JDK 21 not installed yet — an install is a shared-host change; see RUNBOOK step 4)"
mysqld --version 2>&1 || true
echo "  ^ note the MySQL minor version: >=8.0.32 changes mysqldump's"
echo "    --single-transaction privilege requirement (see backup script)."

say "nginx structure (do not proceed if either answer is wrong)"
grep -n 'include /etc/nginx/conf.d' /etc/nginx/nginx.conf || bad "conf.d not included — the rate-limit zones would never load"
grep -n 'include /etc/nginx/sites-enabled' /etc/nginx/nginx.conf || bad "sites-enabled not included"
echo "-- existing global names (a collision with ours = TOTAL nginx outage on reload):"
nginx -T 2>/dev/null | grep -E '^\s*(upstream|limit_req_zone|limit_conn_zone|geo|map)\b' || true
echo "-- any lg_-prefixed name already present? (expect none)"
nginx -T 2>/dev/null | grep -c 'lg_' || true
echo "-- who owns default_server? (must NOT become us)"
nginx -T 2>/dev/null | grep -n 'default_server' || true
echo "-- does the existing logrotate cover our log names?"
grep -n 'var/log/nginx' /etc/logrotate.d/nginx || bad "add deploy/logrotate/lynxiglam-nginx"

say "Neighbour baseline — capture NOW, compare after every step"
for h in pod.kejing.online kejing.online www.kejing.online kejing.site kejing.duckdns.org; do
  printf '  %-24s -> %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' -m 10 "https://$h/" || echo FAIL)"
done
systemctl list-units --type=service --state=running | grep -iE 'uvicorn|gunicorn|celery|docker|mysql|redis|nginx' || true

say "DNS"
dig +short lynxiglam.kejing.online || true
echo "  Host's own public IP: $(curl -s -m 10 https://api.ipify.org || echo '?')"
echo "  These must match before certbot (ACME HTTP-01 needs inbound reachability)."

say "RESULT"
[ "$FAIL" -eq 0 ] && echo "  Pre-flight PASSED — gates above still need a human read." \
                  || echo "  Pre-flight FAILED — STOP. Report to the user; do not improvise."
exit $FAIL
