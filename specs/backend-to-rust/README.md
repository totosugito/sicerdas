# Backend Migration Plan: Fastify/TypeScript → Rust (`backend-rust`)

## Overview
This directory contains the multi-phase specification for migrating the `sicerdas` backend from [backend](file:///home/toto/Documents/sicerdas/backend) (Fastify v5 + TypeScript + Drizzle ORM + `better-auth`) to a new Rust workspace at `/home/toto/Documents/sicerdas/backend-rust`, following the [my-fullstack-rust](file:///home/toto/Documents/sicerdas/.agents/skills/my-fullstack-rust/SKILL.md) skill blueprint.

### Target Rust Stack (Replacing Fastify/TS)
- **Web & Middleware:** `axum` (`0.8`, `multipart`) + `axum-extra` (`0.10`, `cookie`) + `tokio` (`1`) + `tower-http` (`0.6`, `cors`, `compression-gzip`, `trace`, `set-header`, `fs`) + `tower_governor` (rate limiting).
- **Database & Migrations:** `sea-orm` (`1.1`, `sqlx-postgres`, `runtime-tokio-rustls`, `macros`, `with-chrono`, `with-uuid`, `with-json`) for entities, CRUD, and transactions, with `Statement::from_sql_and_values` for complex read/aggregation queries. Drizzle remains the migration source of truth during transition (or `sea-orm-migration` after cutover).
- **Auth & Crypto:** Native Axum + SeaORM (`scrypt`, `hmac`, `sha2`, `subtle`, `base64`, `hex`, `rand`) compatible with `better-auth@1.7.4` cookies/sessions, plus `reqwest` for **Resend** transactional emails (replacing Brevo) and Google OAuth token verification.
- **Caching, Storage & Media:** `moka` (`0.12`, `future` single-flight TTL cache), `aws-config` + `aws-sdk-s3` (S3/R2 + local `/uploads/`), `image` (`0.25`, `jpeg`, `png`, `webp`) replacing `sharp`.
- **Serialization, Config, i18n & Logging:** `serde` + `serde_json` (`preserve_order`, `raw_value`), `chrono` / `time`, `uuid`, `dotenvy`, `build.rs` compile-time typed `LocaleKey` (`locales/id/*.json` default), `tracing` + `tracing-subscriber` + `tracing-appender`.

See [library-mapping.md](./library-mapping.md) for the complete package-by-package replacement table.

---

## Current Backend Inventory
- **Codebase size:** 38,184 LOC in `backend/src`, **188 active route files** (plus 1 empty `exam/leaderboard/index.ts` and 30 `*.hook.ts` files) across **13 domains**.
- **Database:** PostgreSQL (`backend/src/db/schema/` across `ai`, `app`, `book`, `content-report`, `course`, `education`, `enum`, `exam`, `jobs`, `notification`, `periodic-table`, `users`).
- **Auth:** `better-auth@1.7.4` (`admin`, `openAPI`, `emailOTP`, `multiSession`, `customSession` with `role`, `tierId`, `showAds`, `image`; Google OAuth for web + Android + iOS; email templates migrated from Brevo to **Resend**) + 5 custom auth routes in `backend/src/routes/auth/`.
- **Locales:** 12 JSON files in `backend/src/locales/id/` (`auth`, `book`, `chat-ai`, `course`, `dictionary`, `education`, `exam`, `periodic`, `report`, `tier`, `user`, `version`).
- **Scheduled Jobs:** 8 daily maintenance/stats jobs in `backend/src/scripts/schedule/daily/jobs/`.
- **Clients:** `frontend/` (React + TanStack Router/Query, port `5551`, currently has **52 files** importing from `backend/*`), `desktop/`, and `mobile/` (Flutter).

---

## Template Conventions (Rules for All Phases)
1. **1 File = 1 Route (`src/routes/<domain>/...`):** Mirror Fastify's folder-per-group layout, exporting `pub async fn handler(...) -> Result<impl IntoResponse, AppError>` and wiring routes in `mod.rs`.
2. **1 File = 1 Service (`src/modules/<domain>/services/...`):** Keep handlers thin and put DB queries, SeaORM transactions, and business logic in `services/<action>.rs`.
3. **Compile-Time Typed Locales (`locales/id/*.json`):** `build.rs` generates `LocaleKey` from `locales/id/*.json` at compile time (`id` default/fallback, optional `locales/en/*.json` overrides). Missing keys or typos fail `cargo check`.
4. **Session & Read Caching (`moka`):** Use `moka::future::Cache` (`try_get_with` single-flight) in `AppState` for session lookups (60s TTL, invalidated on sign-out/revoke/profile/avatar updates) and hot read paths (e.g. `app`, `version`, `education`, `periodic-table`).
5. **Global Response & Pagination Types:** All endpoints use `src/types/response.rs` (`ApiResponse<T>`, `ErrorResponse`, `PaginationMeta`) and `AppError` (`400`/`401`/`403`/`404`/`409`/`422`/`500` → `{ success: false, message }`).
6. **JSON Parity:** Use `#[serde(rename_all = "camelCase")]` on all DTOs in `src/modules/<domain>/types.rs` so JSON matches TypeScript/Flutter/Desktop contracts.

---

## Migration Phases

| Phase | Spec File | Scope | Routes |
| :--- | :--- | :--- | :--- |
| **Phase 1** | [phase-1-auth-and-foundation.md](./phase-1-auth-and-foundation.md) | **Done & Verified (CLI, Chrome Web, Resend OTP, Android Emulator)** — `backend-rust` workspace, config, Postgres pool, middleware, i18n, health routes, and auth (`better-auth` compat, Google Web + Mobile ID-token, Resend OTP; `RequireAdmin` 403 awaits Phase 2 admin routes) | `health/*` (3) + `auth/*` (5 + `/api/auth/*`) |
| **Phase 2** | [phase-2-users-tiers-and-app.md](./phase-2-users-tiers-and-app.md) | **Done & Verified (CLI + Chrome Web)** — Users (self-service + admin), Tiers, App/Version, Education taxonomy, Content Report, Periodic Table, AI Models (`RequireAdmin` 403 + `moka` cache invalidation verified) | `users/*` (17), `tier/*` (6), `app/*` (5), `version/*` (6), `education/*` (16), `content-report/*` (1), `periodic-table/*` (1), `ai/model/*` (4) |
| **Phase 3** | [phase-3-books-and-courses.md](./phase-3-books-and-courses.md) | **Done & Verified (CLI + Chrome Web)** — Books (public, user interactions, PDF proxy, admin stats) & Courses (courses, chapters, lectures, lecture-texts, enrollments, progress, stats) | `book/*` (12) + `course/*` (40) |
| **Phase 4** | [phase-4-exam-and-jobs.md](./phase-4-exam-and-jobs.md) | Exam engine (subjects, passages, questions, options, solutions, tags, packages, sections, sessions, leaderboard, stats) & 8 daily cron jobs | `exam/*` (72 active) + 8 daily jobs |
| **Phase 5** | [phase-5-cutover-and-static.md](./phase-5-cutover-and-static.md) | Static `/uploads/`, S3/R2 parity, OpenAPI/Scalar (optional), dual-port parity verification, mobile/desktop checks, and cutover | Static + full parity |
| **Phase 6** | [phase-6-frontend-decoupling.md](./phase-6-frontend-decoupling.md) | Decouple `frontend/` from legacy `backend/` (52 files + `tsconfig.json` & `vite.config.ts` aliases) | `frontend/src/api/*`, `frontend/src/routes/*` |

---

## Local Dual-Run Testing Workflow
Keep Fastify running on its default port (`:5550`) and run `backend-rust` on `:5560` during migration:
1. **Fastify (reference):** `cd backend && bun run dev` (`:5550`)
2. **Rust (target):** `cd backend-rust && PORT=5560 cargo run` (`:5560`)
3. **Frontend pointed at Rust:** `frontend/.env` uses `VITE_APP_BASE_URL` (no Vite proxy), so override it at launch:
   `cd frontend && VITE_APP_BASE_URL=http://127.0.0.1:5560 bunx vp dev --port 5552 --host 127.0.0.1`
4. **Checks:**
   - Backend: `cd backend-rust && cargo check && cargo test`
   - Frontend: `cd frontend && bunx tsc --noEmit && bun run build`

---

## Browser Testing (Chrome + REA) — Keep One Browser Open
Run end-to-end checks against the real frontend using **one long-lived Chrome** (driven by REA MCP tools; no extra skill needed) instead of launching/closing a browser per test:

1. **Open Chrome once, headed, with remote debugging** (leave it open for the whole session):
   `google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-rea-profile --no-first-run http://127.0.0.1:5552/sign-in`
2. **Drive it with REA:**
   - `list_browser_targets` with `cdp_endpoint: "http://127.0.0.1:9222"` to get a `target_id`.
   - `capture_browser_scenario` with `browser: { mode: "connect", cdp_endpoint: "http://127.0.0.1:9222", target_id }` (do **not** use `mode: "launch"`; it opens and terminates its own browser each run).
   - The session cookie persists in that Chrome, so log in once and reuse it across scenarios.
3. **Tips & Gotchas:**
   - Wait for the `Sign in` button (`wait_for`) before filling the form; the first Vite load is slow.
   - Keep capture small (`after_each_step: ["url"]`, `at_end: ["url", "accessibility"]`); full network capture can produce 1 MB+ results.
   - Provide test credentials at run time; never commit them.
   - REA has no file-upload action: test avatar/thumbnail uploads with `curl -b <cookiejar> -X PATCH .../avatar -F image=@file.png`, then reload the page in Chrome to verify the image renders.
   - Verify mutations in PostgreSQL directly (e.g. `users_sessions`, `exam_sessions`, `course_enrollments`), not only in the UI.
   - Reverse any account changes made during testing (e.g., change password back, clean up throwaway test rows).
