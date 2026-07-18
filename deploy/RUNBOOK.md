# LynxiGlam Deploy Runbook — lynxiglam.kejing.online

> 🔴 = **touches the shared production host — requires the user's explicit authorization before execution.**
> ⚪ = local / read-only / reversible without touching a neighbour.

This host already serves THREE other projects (PODStudio FastAPI :10000, KeJing
Django :8000, a Docker stack :18080, plus statics). It has **Swap = 0** and its
MySQL **max_connections ceiling has already been hit** (300 configured, 301
peak). We are the fourth tenant and the newest. Every 🔴 step is a change to
someone else's running production environment.

Two rules that override convenience:
- `systemctl reload nginx` — NEVER `restart`.
- If a gate fails, STOP and report. Do not improvise on a shared box.

## Ordering constraint you cannot design around

`generateStaticParams()` (4 route files) calls the API **during `next build`**.
So the API must be live and publicly reachable BEFORE the storefront is built.
The order below is therefore: DB → backend → nginx/TLS → **build** → web.
A "build first, then deploy" order simply does not work here.

---

### Phase 0 — Pre-flight  ⚪ (read-only, but run it ON the host)

1. ⚪ `sudo bash deploy/preflight.sh` — measures live RAM, live MySQL
   connection headroom, port availability, nginx structure, neighbour baseline.
   **Gates: MemAvailable ≥ 4096 MB; (max_connections − Threads_connected) ≥ 40;
   3001 and 8090 free; no `lg_` name collision in `nginx -T`.**
   Any gate failing = STOP + report. The recorded 300/301 figures are a stale
   snapshot; if `Connection_errors_max_connections > 0` right now, adding a
   tenant is a decision for the user, not a formality.
2. ⚪ Save the baseline: `sudo nginx -T > /root/nginx-before-lynxiglam.txt`
   and record every neighbour's HTTP status. This is what "we broke nothing"
   will be measured against.

### Phase 1 — DNS + accounts

3. 🔴 **DNS**: add `A lynxiglam → <host public IP>` in kejing.online's DNS.
   Additive; affects no existing record. Verify: `dig +short lynxiglam.kejing.online`.
4. 🔴 **Install JDK 21**: `sudo apt-get install -y openjdk-21-jdk-headless`.
   Changes the shared host's package set. Confirm the runtime path afterwards —
   `readlink -f $(which java)` — and make `lynxiglam-api.service`'s `ExecStart`
   match it exactly.
5. 🔴 **Create service accounts + tree** (additive):
   ```
   sudo useradd --system --no-create-home --shell /usr/sbin/nologin lynxiglam-api
   sudo useradd --system --no-create-home --shell /usr/sbin/nologin lynxiglam-web
   sudo install -d -m 0755 -o root -g root /opt/lynxiglam /opt/lynxiglam/releases
   sudo install -d -m 0750 -o root -g root /etc/lynxiglam
   sudo install -d -m 0755 -o root -g root /var/www/lynxiglam-acme
   ```
   Two users, not one, so a compromised SSR process cannot read the API's jar.

### Phase 2 — Database

6. 🔴 **MySQL bootstrap** — `sudo mysql --user=root -p < deploy/mysql/001-bootstrap.sql`
   (after replacing both password placeholders with `openssl rand -base64 32`).
   Creates the `lynxiglam` DB + two least-privilege users, **and applies
   `MAX_USER_CONNECTIONS 10`** — the only connection cap the DB itself enforces.
   **Immediately prove isolation (do not defer this):**
   ```
   mysql -h 127.0.0.1 -u lynxiglam -p -e "SHOW DATABASES;"   # ONLY information_schema + lynxiglam
   mysql -h 127.0.0.1 -u lynxiglam -p -e "USE podsys;"       # MUST be ERROR 1044
   mysql -h 127.0.0.1 -u lynxiglam -p -e "USE kejing;"       # MUST be ERROR 1044
   ```
   If either `USE` succeeds: STOP, revoke, report.
7. 🔴 **Secrets**: install `deploy/lynxiglam.env.example` → `/etc/lynxiglam/lynxiglam.env`,
   fill in `DB_PASSWORD`, then `chown root:root && chmod 600`. Verify:
   `sudo stat -c '%U:%G %a' /etc/lynxiglam/lynxiglam.env` → `root:root 600`.

### Phase 3 — Backend

8. ⚪ **Source + build the jar**: clone to `/opt/lynxiglam/src`, then run the
   backend half of `deploy/build.sh`. 🔴 in effect — the Maven build spikes
   memory on a Swap=0 box, which is why it runs inside
   `systemd-run --scope -p MemoryMax=2G`. **Never run a bare `mvnw package`
   here**; an unbudgeted spike can get a *neighbour* OOM-killed.
9. 🔴 **Install the systemd units** (`lynxiglam.slice`, `lynxiglam-api.service`),
   `sudo systemctl daemon-reload`, `sudo systemctl enable --now lynxiglam-api`.
   Flyway runs V1/V2 into `lynxiglam` on first boot.
   **Prove the caps before continuing:**
   ```
   systemctl show -p MemoryMax --value lynxiglam-api.service     # 1073741824
   cat /sys/fs/cgroup/system.slice/lynxiglam-api.service/memory.max   # 1073741824
   ps -o args= -p $(systemctl show -p MainPID --value lynxiglam-api) | tr ' ' '\n' | grep Xmx
   ss -lntp | grep 8090                                          # 127.0.0.1:8090, NOT 0.0.0.0
   journalctl -u lynxiglam-api -b | grep -i 'profile'            # "1 profile is active: prod"
   curl -s 127.0.0.1:8090/api/actuator/health                    # {"status":"UP"}
   curl -s 127.0.0.1:8090/api/products/handles | head -c 200
   ```
   Then re-check `Threads_connected` — it must have risen by ≤ 8.

### Phase 4 — nginx + TLS

10. 🔴 **Phase A vhost**: install `lynxiglam-shared.conf` → `/etc/nginx/conf.d/`,
    `lynxiglam-security-headers.conf` → `/etc/nginx/snippets/`, and the
    **http-bootstrap** vhost → `sites-available/` + symlink into `sites-enabled/`.
    ```
    sudo nginx -t && sudo systemctl reload nginx     # reload. never restart.
    ```
    If `nginx -t` fails, **do not reload** — the running config is still serving
    the neighbours; fix the file first.
11. 🔴 **Certificate** (`certonly`, so certbot writes no nginx config):
    ```
    sudo certbot certonly --webroot -w /var/www/lynxiglam-acme \
         -d lynxiglam.kejing.online --agree-tos -m <you@example.com> --no-eff-email
    ```
12. 🔴 **Phase C vhost**: replace with the TLS `lynxiglam.kejing.online.conf`.
    Check `nginx -v` first: on nginx 1.24 (Ubuntu 24.04's default) `http2 on;`
    is a parse error — use `listen 443 ssl http2;`. Then `nginx -t && systemctl reload nginx`.
    `/` will 502 until step 16 — expected. If a public 502 window is
    unacceptable, temporarily add `allow <your IP>; deny all;` to `location /`.
13. 🔴 **Diff-prove we touched nothing else**:
    ```
    sudo nginx -T > /root/nginx-after-lynxiglam.txt
    diff /root/nginx-before-lynxiglam.txt /root/nginx-after-lynxiglam.txt
    ```
    **Every line of the diff must be ours.** Any change inside a neighbour's
    server block = roll back immediately.
    Then re-curl all five neighbour hosts; statuses must equal the baseline.

### Phase 5 — Storefront

14. 🔴 **Resolve our own hostname to loopback** — add to `/etc/hosts`:
    ```
    127.0.0.1   lynxiglam.kejing.online
    ```
    `/etc/hosts` is a **shared file**. Impact on neighbours is nil (the name is
    ours), but it is still a shared-host edit.
    **Test the alternative first**: `curl -sI https://lynxiglam.kejing.online/api/actuator/health`
    from the host. If that works, hairpin NAT works and this step is optional.
    **If it hangs, this step is mandatory** — many cloud NATs do not hairpin, and
    without it (a) `next build` fails at `generateStaticParams`, and (b) every
    SSR request fails at runtime. It also removes a public round-trip from every
    SSR call and lets `lynxiglam-web.service` keep `IPAddressAllow=localhost`.
15. 🔴 **Build the storefront**: `sudo SRC=/opt/lynxiglam/src bash deploy/build.sh`.
    Memory-capped. Builds with `NEXT_PUBLIC_DATA_SOURCE=api` +
    `NEXT_PUBLIC_API_URL=https://lynxiglam.kejing.online/api`, does a **clean**
    `rm -rf .next` first, copies `public/` and `.next/static/` into the
    standalone tree (Next does not), and **fails the build** if the bundle is
    mock-baked or carries a dev URL.
16. 🔴 **Activate + start**:
    ```
    sudo ln -sfn /opt/lynxiglam/releases/<stamp> /opt/lynxiglam/current.new
    sudo mv -T /opt/lynxiglam/current.new /opt/lynxiglam/current    # atomic
    sudo systemctl enable --now lynxiglam-web
    systemctl show -p MemoryMax --value lynxiglam-web.service       # 536870912
    ss -lntp | grep 3001                                            # 127.0.0.1:3001
    ```

### Phase 6 — Admin, backups, verification

17. 🔴 **Provision the first admin** — without this, `admin_users` is empty and
    `/analytics` is unreachable forever (`AdminBootstrap` is dev/local-only; no
    migration seeds the table).
    ```
    ( umask 077; openssl rand -base64 24 | sudo tee /etc/lynxiglam/admin-password.txt >/dev/null )
    sudo install -m600 -o root -g root deploy/lynxiglam-admin-provision.env.example \
         /etc/lynxiglam/admin-provision.env
    sudo ${EDITOR} /etc/lynxiglam/admin-provision.env      # set APP_ADMIN_EMAIL

    sudo systemd-run --scope --quiet -p MemoryMax=512M -p MemorySwapMax=0 \
      --slice=lynxiglam.slice --uid=lynxiglam-api \
      --property=EnvironmentFile=/etc/lynxiglam/lynxiglam.env \
      --property=EnvironmentFile=/etc/lynxiglam/admin-provision.env \
      --setenv=SPRING_PROFILES_ACTIVE=prod,adminctl \
      /usr/lib/jvm/java-21-openjdk-amd64/bin/java -Xmx256m \
        -jar /opt/lynxiglam/current/backend/store.jar \
        --server.port=0 --spring.datasource.hikari.maximum-pool-size=2
    ```
    Expect: `Admin '…' CREATED with role ADMIN`, exit 0. Then **destroy the
    credentials on disk** and record the password in a password manager:
    ```
    sudo shred -u /etc/lynxiglam/admin-provision.env /etc/lynxiglam/admin-password.txt
    ```
    Confirm: `mysql -h127.0.0.1 -u lynxiglam -p lynxiglam -e "SELECT email,role,active FROM admin_users;"`
    Sign in once at `https://lynxiglam.kejing.online/admin` before deleting anything.
18. 🔴 **Backups**: install `lynxiglam-backup.sh` (0700 root), `backup.cnf` (0600
    root, from `backup.cnf.example`), and the cron file — **after** checking
    existing cron/timers so the hour does not collide with podsys's Celery beat
    or video transcoding. Run it once by hand and read the output (the mysqldump
    privilege fallback is untested against this host's exact MySQL minor version).
19. 🔴 **Restore test**: `sudo bash deploy/backup/lynxiglam-restore-test.sh`.
    Needs a root MySQL credential and creates a scratch DB. An untested backup
    is not a backup.
20. ⚪ **Full verification**: `sudo bash deploy/verify.sh`. Everything must pass,
    especially §11 (runtime mock-bake proof), §7 (neighbour DBs denied) and §13
    (neighbours unharmed).
21. ⚪ **Watch for 24h**: `systemctl status lynxiglam-api lynxiglam-web`,
    `journalctl -u lynxiglam-api -f`, and:
    ```
    cat /sys/fs/cgroup/system.slice/lynxiglam-api.service/memory.events
    ```
    A rising `max`/`oom` counter means the 1 G cap is genuinely binding and the
    JVM needs tuning — **do not "fix" it by raising MemoryMax**; that spends the
    neighbours' safety margin. Reduce `server.tomcat.threads.max` or `-Xmx`.

---

## Rollback

Ordered least- to most-destructive. Steps 1–2 fully remove LynxiGlam from the
public internet in under a minute and touch no neighbour.

1. **Stop our processes** (site down, neighbours untouched):
   `sudo systemctl disable --now lynxiglam-web lynxiglam-api`
2. **Remove our vhost** (nginx serves the neighbours exactly as before):
   ```
   sudo rm /etc/nginx/sites-enabled/lynxiglam.kejing.online
   sudo nginx -t && sudo systemctl reload nginx     # reload, NOT restart
   ```
3. **Roll back to the previous release** (if a bad build is the problem):
   ```
   sudo ln -sfn /opt/lynxiglam/releases/<previous> /opt/lynxiglam/current.new
   sudo mv -T /opt/lynxiglam/current.new /opt/lynxiglam/current
   sudo systemctl restart lynxiglam-api lynxiglam-web
   ```
4. **Remove the http-context config** (only if `nginx -T` shows a collision):
   `sudo rm /etc/nginx/conf.d/lynxiglam-shared.conf && sudo nginx -t && sudo systemctl reload nginx`
5. **Full teardown** — take a final backup FIRST:
   ```
   sudo /usr/local/sbin/lynxiglam-backup.sh
   sudo rm -f /etc/cron.d/lynxiglam-backup
   sudo systemctl disable --now lynxiglam-web lynxiglam-api
   sudo rm /etc/systemd/system/lynxiglam-{api,web}.service /etc/systemd/system/lynxiglam.slice
   sudo systemctl daemon-reload
   sudo rm -rf /opt/lynxiglam /etc/lynxiglam /var/www/lynxiglam-acme
   sudo mysql --user=root -p -e "DROP DATABASE lynxiglam;
     DROP USER 'lynxiglam'@'127.0.0.1'; DROP USER 'lynxiglam_backup'@'127.0.0.1';"
   sudo certbot delete --cert-name lynxiglam.kejing.online
   # /etc/hosts: remove the lynxiglam line. DNS: remove the A record.
   ```
6. **Always finish by proving the neighbours are fine**:
   `sudo nginx -T | diff /root/nginx-before-lynxiglam.txt -` (expect no diff),
   re-curl all five hosts, `systemctl --failed`, `free -m`.

---

## Things flagged as uncertain (verify on the host, do not guess)

1. **JVM path** in `lynxiglam-api.service` — `openjdk-21` vs Adoptium `temurin-21`
   differ. `readlink -f $(which java)` decides. The unit will not start if wrong.
2. **nginx version → `http2 on;` vs `listen 443 ssl http2;`** — `nginx -v` first.
   Wrong form = parse error = reload blocked for every tenant (`nginx -t` catches it).
3. **`mysqldump --single-transaction` privileges** — 8.0.32+ may demand a global
   privilege; the script falls back to `--lock-tables`. Run the first backup by hand.
4. **`SystemCallFilter=@system-service`** with the JVM/Node — normally fine; if a
   unit dies instantly with `SIGSYS`, comment it out and re-add narrowed. Do NOT
   debug this by removing the memory caps.
5. **`"usingMock",0,function(){return true}`** is Turbopack's current minified
   shape, not a stable contract. `build.sh` fails loudly if neither pattern
   matches; `verify.sh` §11 is the version-independent runtime backstop.
6. **Hairpin NAT** — decides whether step 14 is optional or mandatory. Test.
7. **`IPAddressAllow=localhost` on the API** assumes no outbound calls. True today
   (payment deferred). A future Stripe/webhook integration MUST relax this.
8. **Free RAM / connection headroom** — the recorded ~17 G free / 300-301 conns is
   a stale snapshot. Step 1 re-measures.

## The one improvement worth making to this plan

GitHub Actions already runs an `ubuntu-latest` frontend build. Producing the
standalone tarball **in CI** and shipping it would remove the single riskiest
step (the host build's memory spike) from the shared box entirely. It needs CI
work (artifact upload + transfer). Until then, `build.sh` runs the build on the
host inside a memory-capped `systemd-run` scope.
