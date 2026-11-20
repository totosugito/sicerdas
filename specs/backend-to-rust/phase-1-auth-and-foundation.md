# Phase 1: Rust Workspace & Auth Foundation

**Goal:** Stand up `/home/toto/Documents/sicerdas/backend-rust`, connect to PostgreSQL, expose health checks, implement compile-time typed i18n and middleware parity, and guarantee **100% auth compatibility** with `frontend/`, `desktop/`, and `mobile/` before migrating business routes.

---

## 1. Rust Workspace & Core Stack
- **Directory:** `/home/toto/Documents/sicerdas/backend-rust`
- **Core Crates:**
  - `axum` (`0.8`, `multipart`), `axum-extra` (`0.10`, `cookie`), `tokio` (`1`)
  - `tower-http` (`0.6`, `cors`, `compression-gzip`, `trace`, `set-header`, `fs`), `tower_governor`
  - `sea-orm` (`1.1`, `sqlx-postgres`, `runtime-tokio-rustls`, `macros`, `with-chrono`, `with-uuid`, `with-json`)
  - `scrypt` (`0.11`), `hmac` (`0.12`), `sha2` (`0.10`), `subtle` (`2.6`), `base64` (`0.22`), `hex` (`0.4`), `rand` (`0.8`)
  - `moka` (`0.12`, `future`), `aws-config`, `aws-sdk-s3`, `image` (`0.25`)
  - `serde`, `serde_json`, `chrono`, `time`, `uuid`, `dotenvy`, `reqwest`
  - `tracing`, `tracing-subscriber`, `tracing-appender`
- **Shared Foundation Files:**
  - `src/config/mod.rs`: Loads `.env` (with fallback to `../backend/.env`) matching `backend/src/config/env.config.ts` (Postgres, Server/Auth, Google OAuth, Email/`RESEND_API_KEY`, S3/R2, Exam retention, Log settings, Rate limits, Ads config).
  - `src/db/mod.rs`: Pool tuned for VPS (`max_connections(4)`, `min_connections(1)`, `connect_timeout(5s)`, `idle_timeout(5s)`, `sqlx_logging(false)`).
  - `src/error/mod.rs`: `AppError` (`400`, `401`, `403`, `404`, `409`, `422`, `500`) → `{ success: false, message }`.
  - `src/types/response.rs`: `ApiResponse<T>`, `ErrorResponse`, `PaginationMeta`.
  - `build.rs` + `locales/id/*.json`: Compile-time `LocaleKey` generation covering all 12 locale files (`auth`, `book`, `chat-ai`, `course`, `dictionary`, `education`, `exam`, `periodic`, `report`, `tier`, `user`, `version`).
  - `src/app.rs`: CORS, rate limiter, gzip (>1 KB), 11 MB body limit, security headers, slow request logger (`LOG_SLOW_RESPONSE_THRESHOLD`, default 500 ms), `ServeDir` for `/uploads/`.

---

## 2. Health Routes (`src/routes/health/`)
- `GET /api/health/live`
- `GET /api/health/ready` (verifies Postgres pool connectivity)
- `GET /api/health/status`

---

## 3. Auth API Inventory (`backend/src/auth.ts` & `backend/src/routes/auth/`)

### A. Custom Auth Routes (`src/routes/auth/` — 5 routes)
1. **`POST /api/auth/sign-in-email`** (`sign-in-email.ts`)
   - Input: `multipart/form-data` (`email`, `password`).
   - Verifies `scrypt` password hash in `users_accounts`, creates `users_sessions` row, sets signed `${COOKIE_PREFIX}.session_token` cookie, enriches `user` with `role`, `tierId`, `showAds`, `image`, and returns `{ success, message, token, user }`.
2. **`POST /api/auth/email-otp-forget-password`** (`email-otp-forget-password.ts`)
   - Rate-limited (`PASSWORD_RESET_RATE_LIMIT`, `PASSWORD_RESET_RATE_LIMIT_WINDOW_MS`), generates 6-digit OTP in `users_verifications`, sends email via **Resend** REST API (`reqwest`) using `templates/reset-password-otp.html`.
3. **`POST /api/auth/email-otp-verify-forget-password`** (`email-otp-verify-forget-password.ts`)
4. **`POST /api/auth/email-otp-reset-password`** (`email-otp-reset-password.ts`)
5. **`POST /api/auth/email-has-otp`** (`email-has-otp.ts`)

### B. `better-auth` Compatible `/api/auth/*` Endpoints
Unlike `mining-monitor` (where sign-up and Google OAuth were disabled), `sicerdas` has `disableSignUp: false` and active Google OAuth (`webClientId`, `androidClientId`, `iosClientId`) + `mobile/` Flutter client:
- `GET /api/auth/get-session` — Reads signed cookie or `Authorization: Bearer <token>`, returns `{ session, user }` with `customSession` fields (`role`, `tierId`, `showAds`, `image`).
- `POST /api/auth/sign-out` — Deletes session in DB, invalidates `session_cache`, clears cookie.
- `POST /api/auth/sign-up/email` — Creates `users`, `users_accounts` (`scrypt` hash), `users_profiles` (`tierId: "free"`), `users_sessions`, returns session + user.
- `POST /api/auth/revoke-other-sessions` — Deletes all other `users_sessions` for user and invalidates cache.
- Google OAuth (`/api/auth/sign-in/social`, `/api/auth/callback/google`, ID-token verification for mobile) — Verify Google ID token / OAuth callback and link/create user (`accountLinking.trustedProviders: ["google"]`).

### C. Auth Extractors (`src/middleware/auth.rs`)
- `AuthSession`: Extracts session from signed `${COOKIE_PREFIX}.session_token` cookie or `Authorization: Bearer <token>`, backed by `moka::future::Cache` (60s TTL). Returns `401` if missing/expired/banned.
- `RequireAdmin`: Wraps `AuthSession` and enforces `user.role == "admin"` (returns `403` otherwise).

### D. Transactional Email Migration: Brevo → Resend (`src/platform/email.rs`)
Replace `@getbrevo/brevo` (`BREVO_API_KEY`) with **Resend** via `reqwest`:
- **Environment:** `RESEND_API_KEY=re_...` (with sender `NO_REPLY_EMAIL_NAME` / `NO_REPLY_EMAIL`, default `SiCerdas No-Reply <no-reply@sicerdas.com>`).
- **Endpoint:** `POST https://api.resend.com/emails` with `Authorization: Bearer <RESEND_API_KEY>` and JSON body `{ from, to, subject, html }`.
- **Templates:** Reuse `templates/reset-password-otp.html` and `templates/request-password-reset.html` with placeholder substitution (`{{name}}`, `{{email}}`, `{{otp}}` / `{{resetLink}}`, `{{year}}`).
- **DNS (Cloudflare):** Verify `sicerdas.com` in Resend (`resend._domainkey` TXT + `send` MX/SPF TXT with **Proxy OFF / DNS only**), remove old Brevo DKIM/verification records, and update `_dmarc.sicerdas.com` away from `rua@dmarc.brevo.com`.

---

## 4. Phase 1 Acceptance Criteria
- [x] `backend-rust` compiles cleanly (`cargo check && cargo test`: 4/4 unit tests pass) with all 12 `locales/id/*.json` files generating `LocaleKey`.
- [x] `GET /api/health/live`, `/api/health/ready`, `/api/health/status` match Fastify JSON contracts.
- [x] `POST /api/auth/sign-in-email`, `GET /api/auth/get-session`, `POST /api/auth/sign-out`, `POST /api/auth/sign-up/email`, and `POST /api/auth/revoke-other-sessions` pass parity checks with existing Postgres `users` / `users_accounts` / `users_sessions` rows (`smoke-phase1.sh`: `passed=17 failed=0`).
- [x] Email OTP password-reset flow (`email-otp-forget-password` → `email-has-otp` → `verify` → `reset-password`) and **Resend** email delivery work end-to-end (verified via `curl` and in Chrome against `http://127.0.0.1:5551`).
- [x] Google Login works for both **Web OAuth** (`POST /api/auth/sign-in/social` → `/api/auth/callback/google` → session cookie set → user/account/profile/image/session created in Postgres, verified end-to-end in Chrome with `hobigame7@gmail.com`) and **Mobile ID Token** (`POST /api/auth/sign-in/social` with `{ provider: "google", idToken: { token } }` verified end-to-end on Android `emulator-5554` with `hobigame7@gmail.com`, plus email/password `sign-in-email` and `sign-out`).
- [ ] `AuthSession` returns `401` when unauthenticated and `RequireAdmin` returns `403` for non-admin users. *(`AuthSession` `401` verified on `revoke-other-sessions`; `RequireAdmin` `403` will be verified in Phase 2 `users/admin/*`.)*

---

## 5. Google Login Testing Checklist
1. **Mobile ID-Token Flow (`mobile/lib/core/auth/auth_service.dart`):**
   - `POST /api/auth/sign-in/social` with JSON `{ "provider": "google", "idToken": { "token": "<google_id_token>" } }`.
   - Verify Rust validates the Google JWT (`aud` matches `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`, or `GOOGLE_IOS_CLIENT_ID`, valid signature/expiry via Google JWKS or `tokeninfo`).
   - Verify both **new user creation** (`users` + `users_accounts` + `users_profiles` with `tierId: "free"`) and **account linking** when an email/password account with the same email already exists (`accountLinking.trustedProviders: ["google"]`).
   - Verify response returns `{ token, user }` (with `role`, `tierId`, `showAds`, `image`) and sets the signed session cookie.
2. **Web OAuth Flow:**
   - `POST /api/auth/sign-in/social` with `{ "provider": "google", "callbackURL": "..." }` redirects to Google consent screen, and `GET /api/auth/callback/google` exchanges the code using `GOOGLE_CLIENT_SECRET`, creates/links the user, sets the signed `${COOKIE_PREFIX}.session_token` cookie, and redirects back to `callbackURL`.
   - Verify `GET /api/auth/get-session` succeeds immediately after redirect.
