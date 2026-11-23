## IGNORE GIT

```bash
git update-index --assume-unchanged backend/.env
git update-index --assume-unchanged backend/.env.devel
git update-index --assume-unchanged .env
```

## UPDATE package.json

```bash
npx npm-check-updates -u
npx npm-check-updates -u --target minor
npm install
```

## copy frontend to server

```bash
scp -r -P 22 ./dist/* sicerdas@202.155.94.190:/var/www/sicerdas.com/frontend
```

## copy backend to server

```bash
scp -r -P 22 ./backend/dist sicerdas@202.155.94.190:/var/www/sicerdas.com/backend/
```

## SINKRONISASI DATABASE DARI VPS KE LOKAL

Mengambil dump database `sicerdas` langsung dari server VPS via SSH stream (tanpa meninggalkan file sementara di VPS), menyimpannya ke `backup/sicerdas_<timestamp>.sql.gz`, dan langsung mereplace database lokal.

```bash
# Opsi 1: Dari root sicerdas
bun run db:sync_vps
# atau
./scripts/sync-db-from-vps.sh

# Opsi 2: Dari folder backend
cd backend && bun run db:sync_vps
```

## RUN BACKEND RUST (`backend-rust`)

Pastikan PostgreSQL lokal sudah berjalan (database `sicerdas` di `localhost:5432`) dan konfigurasi di `backend-rust/.env` sudah sesuai.

```bash
# Development mode (port 5550)
cd backend-rust
cargo run

# Build & run release mode
cd backend-rust
cargo build --release
./target/release/sicerdas-backend
```

Untuk menjalankan `desktop` bersama `backend-rust`:

```bash
# Dari root sicerdas (port 1552, mengarah ke http://127.0.0.1:5550 di desktop/.env)
bun run desktop:dev
```
