# deploy/ — production deployment artifacts

Everything needed to deploy LynxiGlam to `lynxiglam.kejing.online`. **These are
templates and scripts, not something to run blindly.** The target is a *shared*
production host that already runs three other projects, has **Swap = 0**, and a
MySQL connection ceiling that has already been hit. Read
[`RUNBOOK.md`](RUNBOOK.md) before touching anything.

> Nothing in this directory has been executed. No server was contacted to
> produce it. Every step that changes the shared host is marked 🔴 in the runbook
> and requires the user's explicit authorization.

## Files

| Path | Installs to | What it is |
|---|---|---|
| `RUNBOOK.md` | — | **Start here.** Step-ordered deploy + rollback, with 🔴 authorization gates. |
| `preflight.sh` | run on host | Read-only. Re-measures RAM, MySQL headroom, ports, nginx structure, neighbour baseline. Gates the deploy. |
| `build.sh` | run on host | Memory-capped build of both artifacts + mock-bake proof. Must run on Linux (Windows `.next` is unusable). |
| `verify.sh` | run on host | Read-only proofs of every safety property against the kernel/DB/network, not the config. |
| `systemd/lynxiglam.slice` | `/etc/systemd/system/` | Aggregate 1.6 G / 3-core tenant ceiling — the backstop that protects neighbours. |
| `systemd/lynxiglam-api.service` | `/etc/systemd/system/` | Spring Boot unit: `-Xmx512m`, `MemoryMax=1g`, prod profile, loopback, hardened, egress-locked. |
| `systemd/lynxiglam-web.service` | `/etc/systemd/system/` | Next.js unit: `MemoryMax=512m`, `HOSTNAME=127.0.0.1`, hardened. |
| `nginx/lynxiglam-shared.conf` | `/etc/nginx/conf.d/` | Upstreams + rate-limit zones (all `lg_`-prefixed to avoid collisions). |
| `nginx/lynxiglam-security-headers.conf` | `/etc/nginx/snippets/` | HSTS/CSP/X-Frame/etc. Re-included per location (nginx add_header doesn't merge). |
| `nginx/lynxiglam.kejing.online.http-bootstrap.conf` | `sites-available/` | Phase-A vhost (ACME challenge only). |
| `nginx/lynxiglam.kejing.online.conf` | `sites-available/` | Final TLS vhost: proxy, rate limits, static serving, internal-surface denies. |
| `mysql/001-bootstrap.sql` | run once as root | Creates the `lynxiglam` DB + two least-privilege users. Never grants on a neighbour DB. |
| `lynxiglam.env.example` | `/etc/lynxiglam/lynxiglam.env` | Runtime secrets (DB creds, storefront origin). Real file is root:root 0600, never committed. |
| `lynxiglam-admin-provision.env.example` | `/etc/lynxiglam/admin-provision.env` | Transient admin-provisioning creds. Shredded after use. |
| `backup/lynxiglam-backup.sh` | `/usr/local/sbin/` | Nightly `mysqldump` of the `lynxiglam` DB only, integrity-gated, IO-niced. |
| `backup/lynxiglam-backup.cron` | `/etc/cron.d/` | Cron entry — **pick the hour after checking neighbours' schedules**. |
| `backup/backup.cnf.example` | `/etc/lynxiglam/backup.cnf` | Backup user credentials (root:root 0600). |
| `backup/lynxiglam-restore-test.sh` | run on host | Restores into a scratch DB and asserts shape. An untested backup is a folder. |
| `logrotate/lynxiglam-nginx` | `/etc/logrotate.d/` | **Only if** the stock nginx logrotate doesn't already glob `*.log`. |

## Companion code changes (NOT in this directory)

The runbook depends on these, which live in the application, not in `deploy/`:

- `backend/.../admin/AdminProvisionRunner.java` + `AdminService.upsertAdmin()` —
  the one-shot admin provisioning used by RUNBOOK step 17. Gated on the
  `adminctl` profile; never active in the running service.
- `backend/src/main/resources/application.yml` — `spring.profiles.default: prod`,
  graceful shutdown, pinned session timeout.
- `backend/src/main/resources/application-prod.yml` — swagger/OpenAPI disabled,
  Tomcat thread caps, narrowed actuator, prod logging, Hikari leak detection.

## Hard prerequisites the design surfaced

1. **The backend must be live and public before `next build`** — four routes'
   `generateStaticParams()` call the API at build time. Build order is
   DB → backend → nginx/TLS → build → web.
2. **Build on Linux.** The Windows dev `.next` bundles `sharp-win32-x64` and is
   unusable on the server. `build.sh` does a clean build on the host (or use CI).
3. **`NEXT_PUBLIC_*` is inlined at build time** — the web unit sets none; the
   value is baked by `build.sh`. The mock-bake proof refuses a wrong build.
