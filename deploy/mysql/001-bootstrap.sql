-- =====================================================================
-- LynxiGlam MySQL bootstrap — run ONCE, as an admin, on the SHARED host.
--
--   mysql --user=root --password < deploy/mysql/001-bootstrap.sql
--
-- ############  NEIGHBOUR DATABASES ARE OFF-LIMITS  ###################
-- # This host also serves:
-- #     `podsys`                         -> PODStudio  (FastAPI :10000)
-- #     `kejing`, `kejing_staging`,
-- #     `test_kejing`                    -> KeJing     (Django :8000)
-- # NO GRANT IN THIS FILE, OR ANY FUTURE FILE, MAY NAME THOSE SCHEMAS.
-- # Every grant below is scoped to `lynxiglam`.* — never *.*, never GRANT
-- # OPTION, never a global privilege. If you ever find yourself typing
-- # `ON *.*` for this user, stop: it is wrong.
-- # Proof step is in the RUNBOOK: connecting as this user and running
-- # `USE podsys;` MUST fail with ERROR 1044.
-- ####################################################################
--
-- CONNECTION-CEILING CONTEXT: this server's max_connections is 300 and
-- Max_used_connections has already peaked at 301 — the ceiling has been
-- HIT. LynxiGlam must be structurally incapable of making that worse.
-- Two independent caps, so neither alone is load-bearing:
--   (1) app side  — Hikari maximum-pool-size: 8  (application-prod.yml)
--   (2) server side — MAX_USER_CONNECTIONS 10 below. This one holds even if
--       the app config is edited, a second JVM is started by accident, or
--       Hikari leaks. It is the only cap the DB itself enforces.
-- =====================================================================

-- --- 1. Dedicated database -------------------------------------------
-- Charset/collation must match V1__schema.sql exactly (utf8mb4 /
-- utf8mb4_0900_ai_ci) or Flyway's DDL will inherit a server default that
-- differs and produce collation-mismatch errors on JOINs.
CREATE DATABASE IF NOT EXISTS `lynxiglam`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

-- --- 2. Application user ---------------------------------------------
-- Host is '127.0.0.1', NOT '%' and NOT 'localhost':
--   * '%'         would accept connections from anywhere the port is reachable.
--   * 'localhost' means the UNIX SOCKET in MySQL's account model; the JDBC URL
--     uses TCP to 127.0.0.1, so that account would simply never match.
-- Replace the password with a freshly generated one (openssl rand -base64 32).
-- It must ALSO go into /etc/lynxiglam/lynxiglam.env (root:root 0600) and
-- NOWHERE ELSE. Do not paste it into a chat, a commit, or a shell history line
-- (prefix the mysql invocation with a space if HISTCONTROL=ignorespace).
CREATE USER IF NOT EXISTS 'lynxiglam'@'127.0.0.1'
    IDENTIFIED BY 'REPLACE_ME_WITH_A_GENERATED_PASSWORD'
    WITH MAX_USER_CONNECTIONS 10;   -- 8 Hikari + 1 Flyway + 1 headroom

-- Re-assert the cap even if the user pre-existed (CREATE ... IF NOT EXISTS
-- silently skips the WITH clause on an existing account).
ALTER USER 'lynxiglam'@'127.0.0.1' WITH MAX_USER_CONNECTIONS 10;

-- DML: what the running service needs.
GRANT SELECT, INSERT, UPDATE, DELETE
    ON `lynxiglam`.* TO 'lynxiglam'@'127.0.0.1';

-- DDL: what Flyway needs at startup (spring.flyway.enabled=true,
-- application.yml). Still scoped to `lynxiglam`.* only.
-- REFERENCES is required for the FOREIGN KEYs in V1__schema.sql.
GRANT CREATE, DROP, ALTER, INDEX, REFERENCES, CREATE TEMPORARY TABLES
    ON `lynxiglam`.* TO 'lynxiglam'@'127.0.0.1';

-- Deliberately NOT granted (each would be a way to reach a neighbour):
--   ON *.*            — any global scope
--   GRANT OPTION      — privilege escalation / self-grant
--   SUPER, RELOAD, PROCESS, SHUTDOWN, FILE, REPLICATION *, CREATE USER
--   PROCESS in particular would expose podsys/kejing query text via
--   SHOW PROCESSLIST — a cross-tenant information leak.

-- --- 3. Backup user (read-only, separate identity) --------------------
-- Split from the app user so a compromised app process cannot read the backup
-- credential, and so backup access is independently revocable.
CREATE USER IF NOT EXISTS 'lynxiglam_backup'@'127.0.0.1'
    IDENTIFIED BY 'REPLACE_ME_WITH_A_DIFFERENT_GENERATED_PASSWORD'
    WITH MAX_USER_CONNECTIONS 2;
ALTER USER 'lynxiglam_backup'@'127.0.0.1' WITH MAX_USER_CONNECTIONS 2;

GRANT SELECT, SHOW VIEW, TRIGGER, LOCK TABLES
    ON `lynxiglam`.* TO 'lynxiglam_backup'@'127.0.0.1';

-- FLAGGED — VERIFY, DO NOT ASSUME.
-- mysqldump 8.0.32+ can demand a GLOBAL RELOAD/FLUSH_TABLES privilege for
-- --single-transaction. Granting RELOAD ON *.* to satisfy it would hand this
-- user a global privilege — unacceptable here. The backup script therefore
-- FALLS BACK to --lock-tables (satisfied by LOCK TABLES on `lynxiglam`.* alone,
-- and it only locks OUR tables, so no neighbour is blocked). Confirm the host's
-- exact minor version first:  mysqld --version
-- Under no circumstances "fix" a dump failure with GRANT RELOAD ON *.*.

FLUSH PRIVILEGES;

-- --- 4. Verification (run these; do not assume) -----------------------
-- SHOW GRANTS FOR 'lynxiglam'@'127.0.0.1';
--   -> expect exactly: USAGE ON *.*  +  two lines ON `lynxiglam`.*
--   -> if ANY line reads `ON *.*` with a real privilege: STOP and revoke.
-- SELECT user, host, max_user_connections FROM mysql.user
--   WHERE user LIKE 'lynxiglam%';     -> expect 10 and 2
-- Then, as the app user (this is the real proof, not the grant listing):
--   mysql -h 127.0.0.1 -u lynxiglam -p -e "SHOW DATABASES;"
--     -> expect ONLY: information_schema, lynxiglam
--   mysql -h 127.0.0.1 -u lynxiglam -p -e "USE podsys;"
--     -> MUST fail: ERROR 1044 (42000) Access denied
--   mysql -h 127.0.0.1 -u lynxiglam -p -e "USE kejing;"
--     -> MUST fail: ERROR 1044 (42000) Access denied
