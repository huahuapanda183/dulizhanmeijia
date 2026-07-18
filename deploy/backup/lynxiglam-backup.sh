#!/usr/bin/env bash
# Nightly logical backup of the `lynxiglam` database ONLY.
# Install as /usr/local/sbin/lynxiglam-backup.sh (root:root 0700).
#
# Scope discipline: this script names exactly one database. It must never use
# --all-databases or --databases: podsys / kejing / kejing_staging / test_kejing
# belong to other tenants and are not ours to read, dump, or store. The backup
# credential (lynxiglam_backup@127.0.0.1) cannot reach them anyway — this is the
# second of the two controls.
set -euo pipefail

DB_NAME="lynxiglam"
BACKUP_DIR="/var/backups/lynxiglam"
DEFAULTS_FILE="/etc/lynxiglam/backup.cnf"   # root:root 0600, [client] user/password
RETAIN_DAYS=14
LOCK_FILE="/run/lock/lynxiglam-backup.lock"

log() { printf '%s lynxiglam-backup: %s\n' "$(date -Is)" "$*"; }

# Never let two dumps overlap: on a Swap=0 box, two gzip+mysqldump pipelines is
# exactly the kind of unbudgeted spike that reaches the OOM killer — which has
# no notion of whose process matters and may take a neighbour instead.
exec 9>"$LOCK_FILE"
flock -n 9 || { log "another run holds the lock; exiting"; exit 0; }

install -d -m 0700 -o root -g root "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="${BACKUP_DIR}/${DB_NAME}-${STAMP}.sql.gz"
TMP="${OUT}.partial"

# --no-tablespaces  : avoids needing the GLOBAL `PROCESS` privilege (which would
#                     also expose neighbours' queries via SHOW PROCESSLIST).
# --set-gtid-purged=OFF : otherwise the dump embeds SET @@GLOBAL.gtid_purged and
#                     restoring needs SUPER. Also makes restore-into-a-scratch-DB work.
# -c / --complete-insert : column-named INSERTs survive column reordering.
COMMON_ARGS=(
  --defaults-file="$DEFAULTS_FILE"
  --host=127.0.0.1
  --protocol=TCP
  --no-tablespaces
  --set-gtid-purged=OFF
  --routines
  --triggers
  --complete-insert
  --quick
  --hex-blob
  --default-character-set=utf8mb4
)

dump() {
  # nice/ionice: this box's InnoDB buffer pool is ~26GB and podsys runs Celery
  # video transcoding. Our backup yields to everything.
  nice -n 15 ionice -c3 mysqldump "${COMMON_ARGS[@]}" "$@" "$DB_NAME"
}

log "starting dump of ${DB_NAME}"

# Preferred: --single-transaction (consistent InnoDB snapshot, blocks no writes).
# FALLBACK: mysqldump 8.0.32+ may demand a GLOBAL RELOAD/FLUSH_TABLES privilege
# for it. Granting RELOAD ON *.* would give this user a global privilege on a
# shared server — NOT acceptable. --lock-tables needs only LOCK TABLES on
# `lynxiglam`.* and locks OUR tables alone, so no neighbour is blocked. The
# tradeoff is a few seconds of blocked writes to our own low-traffic DB.
if dump --single-transaction 2>"${TMP}.err" | gzip -6 > "$TMP"; then
  log "dumped with --single-transaction"
elif grep -qiE 'RELOAD|FLUSH_TABLES|Access denied' "${TMP}.err"; then
  log "WARN: --single-transaction denied (mysqldump >=8.0.32 privilege change);"
  log "WARN: falling back to --lock-tables. DO NOT 'fix' this with GRANT RELOAD ON *.*"
  dump --lock-tables | gzip -6 > "$TMP"
else
  log "ERROR: dump failed:"; cat "${TMP}.err" >&2
  rm -f "$TMP" "${TMP}.err"; exit 1
fi
rm -f "${TMP}.err"

# Integrity gate: a truncated/garbage dump that silently replaces a good one is
# worse than a loud failure.
gzip -t "$TMP"
zcat "$TMP" | tail -5 | grep -q 'Dump completed' \
  || { log "ERROR: dump lacks completion marker — refusing to publish"; rm -f "$TMP"; exit 1; }

SIZE=$(stat -c%s "$TMP")
[ "$SIZE" -gt 10240 ] || { log "ERROR: dump only ${SIZE}B — refusing"; rm -f "$TMP"; exit 1; }

mv "$TMP" "$OUT"
chmod 0600 "$OUT"
log "wrote ${OUT} (${SIZE} bytes)"

# Retention. -mtime works because the filename stamp is not load-bearing here.
find "$BACKUP_DIR" -name "${DB_NAME}-*.sql.gz" -type f -mtime "+${RETAIN_DAYS}" -print -delete

# Disk guard: 484G volume shared with podsys/MinIO/Docker. Warn before we are
# the reason a co-tenant's write fails.
USED_PCT=$(df --output=pcent "$BACKUP_DIR" | tail -1 | tr -dc '0-9')
[ "$USED_PCT" -lt 90 ] || log "WARN: filesystem ${USED_PCT}% full — shared volume, investigate now"

log "done"
