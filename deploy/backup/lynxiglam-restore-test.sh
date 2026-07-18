#!/usr/bin/env bash
# Restore test. An untested backup is not a backup; it is a folder.
#
# TOUCHES THE SHARED HOST: creates a scratch database and needs an admin
# MySQL credential (the least-privilege lynxiglam user cannot CREATE DATABASE).
# Requires explicit authorization. Run after the first backup, after any Flyway
# migration, and quarterly.
#
# Usage: sudo ./lynxiglam-restore-test.sh [/var/backups/lynxiglam/<file>.sql.gz]
set -euo pipefail

SCRATCH_DB="lynxiglam_restore_test"
BACKUP_DIR="/var/backups/lynxiglam"
SRC="${1:-$(ls -1t ${BACKUP_DIR}/lynxiglam-*.sql.gz | head -1)}"

# ---- Guard: never let a typo point this at a neighbour's schema -------------
case "$SCRATCH_DB" in
  podsys|kejing|kejing_staging|test_kejing|lynxiglam|mysql|sys)
    echo "REFUSING: '$SCRATCH_DB' is a real database. This script DROPs its target."; exit 1;;
esac

echo "Restoring ${SRC} -> ${SCRATCH_DB} (scratch; will be dropped at the end)"
read -rp "Type the scratch DB name to confirm: " CONFIRM
[ "$CONFIRM" = "$SCRATCH_DB" ] || { echo "aborted"; exit 1; }

mysql --user=root -p -e "DROP DATABASE IF EXISTS \`${SCRATCH_DB}\`;
  CREATE DATABASE \`${SCRATCH_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"

# nice/ionice again: a full import competes for IO with a 26GB-buffer-pool
# InnoDB that three other projects depend on.
zcat "$SRC" | nice -n 15 ionice -c3 mysql --user=root -p "$SCRATCH_DB"

echo "--- Restore assertions (must match production shape) ---"
mysql --user=root -p "$SCRATCH_DB" -e "
  SELECT COUNT(*) AS products     FROM products;
  SELECT COUNT(*) AS collections  FROM collections;
  SELECT COUNT(*) AS admin_users  FROM admin_users;
  SELECT COUNT(*) AS orders       FROM orders;
  SELECT COUNT(*) AS bad_dates    FROM products WHERE created_at IS NULL OR YEAR(created_at) < 2000;
  SELECT success, version, description FROM flyway_schema_history ORDER BY installed_rank;"

# products must be 32 (the CI seed assertion) unless the catalog has since
# changed. bad_dates must be 0 — commit af6c52e fixed datetime literals that
# MySQL silently zeroed; this is the regression tripwire.
echo
echo "CHECK MANUALLY: products = 32 (or the current catalog size); bad_dates = 0;"
echo "               admin_users >= 1; every flyway row success = 1."
read -rp "Assertions passed? Drop the scratch DB now? [y/N] " OK
[ "$OK" = "y" ] && mysql --user=root -p -e "DROP DATABASE \`${SCRATCH_DB}\`;" && echo "scratch dropped"
