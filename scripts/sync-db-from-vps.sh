#!/usr/bin/env bash
# ==============================================================================
# Script: sync-db-from-vps.sh
# Tujuan:
#   1. Mengambil dump database sicerdas langsung dari server VPS via SSH
#      (disimpan ke folder backup/ lokal dalam format .sql.gz tanpa membuat file di VPS).
#   2. Menghapus dan mereplace database / tabel sicerdas lokal dengan data terbaru tsb.
# ==============================================================================

set -euo pipefail

# Direktori proyek (root sicerdas)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backup"
BACKEND_ENV="${ROOT_DIR}/backend/.env"

# Cek alias SSH: prioritaskan VPS_HOST env, lalu tes sicerdas-vps, default mining-vps
if [ -z "${VPS_HOST:-}" ]; then
    if ssh -q -o BatchMode=yes -o ConnectTimeout=2 "sicerdas-vps" exit 2>/dev/null; then
        VPS_HOST="sicerdas-vps"
    else
        VPS_HOST="mining-vps"
    fi
fi

# Konfigurasi VPS
VPS_PGUSER="${VPS_PGUSER:-postgres}"
VPS_PGDB="${VPS_PGDB:-sicerdas}"
VPS_PGPASS="${VPS_PGPASS:-BetyFahim3}"

# Baca konfigurasi database lokal dari backend/.env jika ada
if [ -f "$BACKEND_ENV" ]; then
    # Parse key=val sederhana dari .env
    LOCAL_PGHOST=$(grep -E '^POSTGRES_HOST=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '\r"' || true)
    LOCAL_PGPORT=$(grep -E '^POSTGRES_PORT=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '\r"' || true)
    LOCAL_PGUSER=$(grep -E '^POSTGRES_USER=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '\r"' || true)
    LOCAL_PGPASS=$(grep -E '^POSTGRES_PASSWORD=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '\r"' || true)
    LOCAL_PGDB=$(grep -E '^POSTGRES_DB=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '\r"' || true)
fi

# Nilai default jika tidak terdefinisi di .env
LOCAL_PGHOST="${LOCAL_PGHOST:-localhost}"
LOCAL_PGPORT="${LOCAL_PGPORT:-5432}"
LOCAL_PGUSER="${LOCAL_PGUSER:-postgres}"
LOCAL_PGPASS="${LOCAL_PGPASS:-a}"
LOCAL_PGDB="${LOCAL_PGDB:-sicerdas}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="${BACKUP_DIR}/sicerdas_${TIMESTAMP}.sql.gz"
LATEST_SYMLINK="${BACKUP_DIR}/sicerdas_latest.sql.gz"

echo "=========================================================="
echo "   Sync Database: VPS (${VPS_HOST}) -> Local (${LOCAL_PGDB})"
echo "=========================================================="
echo "Tanggal      : $(date)"
echo "Tujuan Backup: ${BACKUP_FILE}"
echo "Target Lokal : postgres://${LOCAL_PGUSER}@${LOCAL_PGHOST}:${LOCAL_PGPORT}/${LOCAL_PGDB}"
echo "----------------------------------------------------------"

# 1. Cek koneksi SSH ke VPS
echo ">> [1/4] Memeriksa koneksi SSH ke ${VPS_HOST}..."
if ! ssh -q -o BatchMode=yes -o ConnectTimeout=5 "${VPS_HOST}" exit; then
    echo "ERROR: Gagal terhubung ke host SSH '${VPS_HOST}'. Pastikan alias sudah terdaftar di ~/.ssh/config dan kunci SSH aktif." >&2
    exit 1
fi
echo "         SSH terhubung."

# 2. Dump langsung dari VPS via stream SSH ke file lokal
echo ">> [2/4] Mengambil database '${VPS_PGDB}' dari VPS (stream via SSH)..."
ssh "${VPS_HOST}" "PGPASSWORD='${VPS_PGPASS}' pg_dump -h localhost -U '${VPS_PGUSER}' -d '${VPS_PGDB}' --no-owner --no-privileges" \
    | gzip > "${BACKUP_FILE}"

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "         Backup berhasil disimpan: ${BACKUP_FILE} (${FILE_SIZE})"
ln -sf "sicerdas_${TIMESTAMP}.sql.gz" "${LATEST_SYMLINK}"

# 3. Bersihkan skema lokal public
echo ">> [3/4] Menyiapkan database lokal (reset schema public)..."
PGPASSWORD="${LOCAL_PGPASS}" psql -h "${LOCAL_PGHOST}" -p "${LOCAL_PGPORT}" -U "${LOCAL_PGUSER}" -d "${LOCAL_PGDB}" -v ON_ERROR_STOP=1 >/dev/null <<EOF
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO ${LOCAL_PGUSER};
GRANT ALL ON SCHEMA public TO public;
EOF
echo "         Schema public lokal bersih."

# 4. Restore ke database lokal
echo ">> [4/4] Memulihkan data terbaru ke database lokal '${LOCAL_PGDB}'..."
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${LOCAL_PGPASS}" psql -h "${LOCAL_PGHOST}" -p "${LOCAL_PGPORT}" -U "${LOCAL_PGUSER}" -d "${LOCAL_PGDB}" -v ON_ERROR_STOP=1 >/dev/null

echo "----------------------------------------------------------"
# Verifikasi hasil
TOTAL_TABLES=$(PGPASSWORD="${LOCAL_PGPASS}" psql -h "${LOCAL_PGHOST}" -p "${LOCAL_PGPORT}" -U "${LOCAL_PGUSER}" -d "${LOCAL_PGDB}" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
TOTAL_USERS=$(PGPASSWORD="${LOCAL_PGPASS}" psql -h "${LOCAL_PGHOST}" -p "${LOCAL_PGPORT}" -U "${LOCAL_PGUSER}" -d "${LOCAL_PGDB}" -tAc "SELECT count(*) FROM users;")
TOTAL_BOOKS=$(PGPASSWORD="${LOCAL_PGPASS}" psql -h "${LOCAL_PGHOST}" -p "${LOCAL_PGPORT}" -U "${LOCAL_PGUSER}" -d "${LOCAL_PGDB}" -tAc "SELECT count(*) FROM books;")
TOTAL_QUESTIONS=$(PGPASSWORD="${LOCAL_PGPASS}" psql -h "${LOCAL_PGHOST}" -p "${LOCAL_PGPORT}" -U "${LOCAL_PGUSER}" -d "${LOCAL_PGDB}" -tAc "SELECT count(*) FROM exam_questions;")
TOTAL_PACKAGES=$(PGPASSWORD="${LOCAL_PGPASS}" psql -h "${LOCAL_PGHOST}" -p "${LOCAL_PGPORT}" -U "${LOCAL_PGUSER}" -d "${LOCAL_PGDB}" -tAc "SELECT count(*) FROM exam_packages;")
TOTAL_SESSIONS=$(PGPASSWORD="${LOCAL_PGPASS}" psql -h "${LOCAL_PGHOST}" -p "${LOCAL_PGPORT}" -U "${LOCAL_PGUSER}" -d "${LOCAL_PGDB}" -tAc "SELECT count(*) FROM exam_sessions;")

echo "SUKSES! Database lokal telah sinkron dengan VPS."
echo "Ringkasan data lokal:"
echo " - Jumlah Tabel   : ${TOTAL_TABLES}"
echo " - Users          : ${TOTAL_USERS}"
echo " - Books          : ${TOTAL_BOOKS}"
echo " - Exam Questions : ${TOTAL_QUESTIONS}"
echo " - Exam Packages  : ${TOTAL_PACKAGES}"
echo " - Exam Sessions  : ${TOTAL_SESSIONS}"
echo "=========================================================="
