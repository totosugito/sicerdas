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
