# Scheduled Jobs Setup & Execution Guide (Linux / Ubuntu)

This guide documents how to execute and automate scheduled background jobs in the `sicerdas` backend on Linux Ubuntu systems.

---

## 1. Overview of Scheduled Jobs

The daily scheduled jobs script is located at:
`backend/src/scripts/schedule/daily/daily.ts`

It sequentially executes the following 6 background maintenance and aggregation tasks:
1. **Archiving Guest Events** (Archiving old view/download logs)
2. **Updating Book Statistics** (Batch updating metrics across catalog books)
3. **Reconciling Exam Statistics** (Rebuilding global, subject, and tag exam stats)
4. **Purging Old Exam Answers** (Cleaning up old session answer records)
5. **Cleaning Stale Sessions** (Marking abandoned exam sessions)
6. **Updating User Statistics** (Performing hybrid rollup for DAU, WAU, and MAU stats)

---

## 2. Manual CLI Execution

You can run the daily jobs script manually on demand via Bun from the backend directory:

```bash
cd /home/toto/Documents/sicerdas/backend
bun run src/scripts/schedule/daily/daily.ts
```

---

## 3. Automation via Cron (`crontab`)

Setting up a user-level cron job is the standard lightweight approach for automated periodic execution on Linux.

### Steps:

1. **Find absolute path to Bun executable:**
   ```bash
   which bun
   ```
   *(e.g., `/home/toto/.bun/bin/bun` or `/usr/local/bin/bun`)*

2. **Open the Crontab Editor:**
   ```bash
   crontab -e
   ```

3. **Add the Cron Entry (runs daily at 00:00 midnight):**
   ```cron
   0 0 * * * cd /home/toto/Documents/sicerdas/backend && /home/toto/.bun/bin/bun run src/scripts/schedule/daily/daily.ts >> /home/toto/Documents/sicerdas/backend/daily_cron.log 2>&1
   ```

> **Note:** Output and errors are logged to `daily_cron.log` for debugging.

---

## 4. Automation via `systemd` Service & Timer (Production-ready)

For production environments, using a `systemd` service and timer provides enhanced logging (via `journalctl`), automatic status tracking, and dependency management.

### Step 1: Create Service File
Create `/etc/systemd/system/sicerdas-daily-job.service`:

```ini
[Unit]
Description=Sicerdas Daily Scheduled Maintenance Jobs
After=network.target

[Service]
Type=oneshot
User=toto
WorkingDirectory=/home/toto/Documents/sicerdas/backend
ExecStart=/home/toto/.bun/bin/bun run src/scripts/schedule/daily/daily.ts
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Step 2: Create Timer File
Create `/etc/systemd/system/sicerdas-daily-job.timer`:

```ini
[Unit]
Description=Run Sicerdas Daily Scheduled Jobs at midnight

[Timer]
OnCalendar=*-*-* 00:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

### Step 3: Enable & Start Timer
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now sicerdas-daily-job.timer
```

### Step 4: Verification & Logging
Check timer status:
```bash
systemctl list-timers | grep sicerdas
```

View execution logs:
```bash
journalctl -u sicerdas-daily-job.service -n 100 --no-pager
```
