#!/usr/bin/env bash
# ==============================================================================
# Script: backup-dbs-to-r2.sh
# Purpose:
#   Daily PostgreSQL backup for `sicerdas` and `mining_rank` databases on VPS.
#   Dumps both databases in custom format (-Fc), packages them into a single
#   .tar.gz archive, uploads to Cloudflare R2 (`backups/`), and cleans up
#   local temporary files.
#
# Cron example (03:00 WIB daily):
#   0 3 * * * /var/www/sicerdas.com/scripts/backup-dbs-to-r2.sh >> /var/www/sicerdas.com/logs/db-backup.log 2>&1
# ==============================================================================
set -euo pipefail

ENV_FILE="${ENV_FILE:-/var/www/sicerdas.com/backend-rust/.env}"
RCLONE_BIN="${RCLONE_BIN:-/home/sicerdas/.local/bin/rclone}"
WORK_DIR="${WORK_BASE_DIR:-/home/sicerdas/tmp-db-backup}/$(date -u +%Y%m%dT%H%M%SZ)"
DATE_TAG="$(date +%Y-%m-%d)"
ARCHIVE_NAME="db-backup-${DATE_TAG}.tar.gz"

cleanup() {
    rm -rf "${WORK_DIR}"
}
trap cleanup EXIT

get_env() {
    local key="$1"
    grep -E "^${key}=" "${ENV_FILE}" | head -n1 | cut -d= -f2- | tr -d '\r' | sed -e 's/^["'\'']//' -e 's/["'\'']$//'
}

PGUSER="$(get_env POSTGRES_USER)"
PGPASSWORD="$(get_env POSTGRES_PASSWORD)"
PGHOST="$(get_env POSTGRES_HOST)"
S3_BUCKET_NAME="$(get_env S3_BUCKET_NAME)"
S3_ACCESS_KEY_ID="$(get_env S3_ACCESS_KEY_ID)"
S3_SECRET_ACCESS_KEY="$(get_env S3_SECRET_ACCESS_KEY)"
S3_ENDPOINT="$(get_env S3_ENDPOINT)"

export PGHOST PGUSER PGPASSWORD
export RCLONE_CONFIG_R2_TYPE="s3"
export RCLONE_CONFIG_R2_PROVIDER="Cloudflare"
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}"
export RCLONE_CONFIG_R2_ENDPOINT="${S3_ENDPOINT}"
export RCLONE_CONFIG_R2_ACL="private"

mkdir -p "${WORK_DIR}"

echo "[$(date -Is)] Starting DB backup..."

pg_dump -h "${PGHOST}" -p 5432 -U "${PGUSER}" -Fc -f "${WORK_DIR}/sicerdas.dump" sicerdas
echo "[$(date -Is)] Dumped sicerdas ($(du -h "${WORK_DIR}/sicerdas.dump" | cut -f1))"

pg_dump -h "${PGHOST}" -p 5432 -U "${PGUSER}" -Fc -f "${WORK_DIR}/mining_rank.dump" mining_rank
echo "[$(date -Is)] Dumped mining_rank ($(du -h "${WORK_DIR}/mining_rank.dump" | cut -f1))"

tar -czf "${WORK_DIR}/${ARCHIVE_NAME}" -C "${WORK_DIR}" sicerdas.dump mining_rank.dump
echo "[$(date -Is)] Created ${ARCHIVE_NAME} ($(du -h "${WORK_DIR}/${ARCHIVE_NAME}" | cut -f1))"

"${RCLONE_BIN}" copyto "${WORK_DIR}/${ARCHIVE_NAME}" "r2:${S3_BUCKET_NAME}/backups/${ARCHIVE_NAME}" --no-check-dest
echo "[$(date -Is)] Uploaded to r2:${S3_BUCKET_NAME}/backups/${ARCHIVE_NAME}"

echo "[$(date -Is)] Verifying remote object:"
"${RCLONE_BIN}" lsl "r2:${S3_BUCKET_NAME}/backups/${ARCHIVE_NAME}"
echo "[$(date -Is)] Backup complete."
