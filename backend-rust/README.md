# SiCerdas Backend (Rust)

Axum + SeaORM backend API for SiCerdas.

## Environment Configuration

`AppConfig::from_env()` selects the environment file based on `NODE_ENV` (defaults to `development`):

| `NODE_ENV`                                    | Loaded file (in `backend-rust/`) | Fallback                                        |
| :-------------------------------------------- | :------------------------------- | :---------------------------------------------- |
| `development` (default)                       | `.env.devel`                     | `../backend/.env.devel`, then `../backend/.env` |
| `production` (or any non-`development` value) | `.env`                           | `../backend/.env`                               |

## S3 / Cloudflare R2 Storage (Dev vs Production)

Storage is handled by `StorageClient` (`src/platform/storage.rs`). Keep separate buckets in `.env.devel` and `.env` so dev uploads and deletions never affect production assets:

| Setting          | Development (`.env.devel`)                     | Production (`.env`)            |
| :--------------- | :--------------------------------------------- | :----------------------------- |
| `USE_S3_STORAGE` | `true` (or `false` for local `uploads/` disk)  | `true`                         |
| `S3_BUCKET_NAME` | `si-cerdas-dev`                                | `si-cerdas`                    |
| `S3_PUBLIC_URL`  | `https://storage-dev.sicerdas.com`             | `https://storage.sicerdas.com` |
| `S3_ENDPOINT`    | Cloudflare R2 S3 endpoint                      | Cloudflare R2 S3 endpoint      |
| `UPLOAD_DIR`     | `/uploads/` (used as key prefix `uploads/...`) | `/uploads/`                    |

> Keep `.env.devel` as a separate file rather than a symlink to `.env` so dev and prod S3 settings stay isolated.

## Running Locally

1. Sync local PostgreSQL from VPS (optional, ensures schema & data match production):
   ```bash
   ../scripts/sync-db-from-vps.sh
   ```
2. Start the server in development mode (loads `.env.devel`):
   ```bash
   NODE_ENV=development cargo run
   ```
   By default it listens on `http://127.0.0.1:5550`.
