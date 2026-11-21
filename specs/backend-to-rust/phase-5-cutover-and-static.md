# Phase 5: Static Assets, S3/R2, Client Parity & Cutover

**Goal:** Verify static file serving, S3/R2 storage, OpenAPI/Scalar docs (if needed), and end-to-end parity across `frontend/`, `desktop/`, and `mobile/` before retiring `backend/`.

---

## 1. Static Files & Storage Parity
- **`/uploads/` (`ServeDir`):**
  - Mirror Fastify's `@fastify/static` config (`../uploads` relative to `backend-rust`, auto-created if missing).
  - Set `Cross-Origin-Resource-Policy: cross-origin` header on all `/uploads/*` responses.
- **S3 / Cloudflare R2 (`USE_S3_STORAGE=true`):**
  - Verify upload, overwrite, delete, and public URL generation (`S3_PUBLIC_URL`, `S3_BUCKET_NAME`, `S3_ENDPOINT`, `S3_REGION`) for user avatars and course thumbnails.

---

## 2. Optional OpenAPI / Scalar
- Fastify currently mounts `@scalar/fastify-api-reference` and `better-auth` `openAPI({ path: "/docs" })`.
- Decide before cutover whether to expose `utoipa-scalar` in `backend-rust` or restrict docs to dev environments.

---

## 3. Dual-Port Parity & Client Verification
- Run Fastify (`:5550`) and `backend-rust` (`:5560`) side-by-side against the same PostgreSQL instance.
- Verify:
  1. **Web (`frontend/`):** Run with `VITE_APP_BASE_URL=http://127.0.0.1:5560` on `:5552` (via Chrome + REA connect mode) — test sign-in, sign-up, Google login, OTP password reset, profile/avatar, books + PDF viewer, courses + lecture texts, and full exam session flow.
  2. **Desktop (`desktop/`):** Point API base URL to `:5560` and verify auth + core flows.
  3. **Mobile (`mobile/` Flutter):** Point API base URL to `:5560` and verify Bearer token auth, Google OAuth, app/version check, tiers/ads config, books, courses, and exams.
  4. **Rate limit & 404 handler:** Verify 404 rate-limit behavior and `{ success: false, message }` error normalization.

---

## 4. Production Cutover Checklist
- [x] `cd backend-rust && cargo build --release && cargo test` passes with zero errors (`4 passed; 0 failed`).
- [x] `/uploads/` static serving (`Cross-Origin-Resource-Policy: cross-origin`), `{ success: false, message }` 404 normalization, cross-phase smoke parity, and `frontend/` `bun run build` verified.
- [x] Backed up production DB (`/var/www/sicerdas.com/temp/sicerdas_pre_rust_20261121.sql.gz`, `3.0M`) and `frontend` (`/var/www/sicerdas.com/temp/frontend.bak.20261121`), applied missing schema updates + `0001_high_volume_job_indexes.sql`.
- [x] Disabled legacy Node `sicerdas.service` (`active=inactive`, `enabled=disabled`), enabled & started `sicerdas-rust.service` on `:5550`, and scheduled daily cron (`0 2 * * * ... NODE_ENV=production ./sicerdas-backend job daily-all`, verified `8/8` jobs in `0.29s`).
- [ ] Monitor `logs/` for `Slow request detected` or `5xx` errors for 24–48 hours; keep `backend/` as cold rollback until verified.

---

## 5. Production Server Before vs After Cutover Report (`202.155.94.190`, `2026-11-21`)

### Memory & Resource Usage
| Metric | Before (Node/Fastify `sicerdas.service`) | After (Rust `sicerdas-rust.service`) | Improvement |
| :--- | ---: | ---: | :--- |
| **Service `MemoryCurrent`** | `223.1 MB` (`233,963,520` B) | `19.2 MB` (`20,115,456` B) | **-91.4% (~11.6x lower)** |
| **Process `RSS`** | `149.4 MB` (`153,036` KB) | `28.5 MB` (`29,160` KB) | **-80.9% (~5.2x lower)** |
| **System RAM Used** | `516 MB` / `956 MB` | `322 MB` / `956 MB` | **-194 MB freed** |
| **System RAM Available** | `439 MB` | `633 MB` | **+194 MB** |
| **System Swap Used** | `304 MB` | `107 MB` | **-197 MB** |

### Live HTTPS Endpoint Latency (Measured on Server via `https://api.sicerdas.com` & `https://sicerdas.com`)
| Endpoint | Before (Node/Fastify) | After (Rust) |
| :--- | :--- | :--- |
| `GET /api/health` | `404` (`100.8ms`) | `200` (`41.4ms`) |
| `GET /api/health/ready` | — | `200` (`26.2ms`) |
| `GET /api/tier/app-tier` | `200` (`81.0ms`) | `200` (`37.0ms`) |
| `GET /api/book/filter-params` | `200` (`50.4ms`) | `200` (`29.5ms`) |
| `GET /api/periodic-table/element/1` | — | `200` (`32.1ms`) |
| `POST /api/book/list` | `200` (`109.2ms`) | `200` (`83.0ms`) |
| `POST /api/course/courses/list` | — | `200` (`39.8ms`) |
| `POST /api/exam/packages/list` | `200` (`59.8ms`) | `200` (`32.8ms`) |
| `GET https://sicerdas.com/` | — | `200` (`40.7ms`) |

### Daily Jobs CLI (`NODE_ENV=production ./sicerdas-backend job daily-all`)
- **All 8 jobs completed in `0.29s`** on production DB (`archive-guest-events`: `3,906` updated, `13,628` deleted; `clean-stale-sessions`: `2` cleaned; `compute-course-stats`, `compute-exam-stats`, `purge-old-exam-answers`, `reconcile-exam-stats`, `update-book-stats`, `update-user-stats` all succeeded).
