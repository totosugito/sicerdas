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
- [ ] `cd backend-rust && cargo build --release && cargo test` passes with zero errors.
- [ ] Systemd/process manager switches port `5550` from `backend/` to `backend-rust` binary, and daily cron invokes `backend-rust` job subcommands.
- [ ] Monitor `logs/` for `Slow request detected` or `5xx` errors for 24–48 hours; keep `backend/` as cold rollback until verified.
