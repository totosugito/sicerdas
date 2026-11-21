---
name: my-fullstack-rust
description: Project conventions and modular fullstack blueprint for mining-monitor (`backend-rust` with Axum + SeaORM + serde + typed locales, and `frontend` with React + TanStack Router/Query + self-contained API types). Use when adding, refactoring, or migrating fullstack features across `backend-rust/` and `frontend/`.
---

# Mining Monitor Fullstack Skill (`backend-rust` + `frontend`)

Use this blueprint whenever creating or updating fullstack features in `mining-monitor`. The legacy `backend/` (Fastify/TS) is retired; all new backend work goes into `backend-rust/`, and `frontend/` must remain 100% decoupled from `backend/`.

---

## 0. Standard Tech Stack & Libraries

### Backend (`backend-rust/Cargo.toml`)
- **Web & Middleware**: `axum` (`0.8`, `multipart`), `axum-extra` (`0.10`, `cookie`), `tokio` (`1`), `tower-http` (`0.6`, `cors`, `compression-gzip`, `trace`, `set-header`, `fs`)
- **Database**: `sea-orm` (`1.1`, `sqlx-postgres`, `runtime-tokio-rustls`, `macros`, `with-chrono`, `with-uuid`, `with-json`)
- **Auth & Crypto**: `scrypt` (`0.11`), `hmac` (`0.12`), `sha2` (`0.10`), `subtle` (`2.6`), `base64` (`0.22`), `hex` (`0.4`), `rand` (`0.8`)
- **Caching, Storage & Media**: `moka` (`0.12`, `future`), `aws-config` (`1`) + `aws-sdk-s3` (`1`), `image` (`0.25`, `jpeg`, `png`, `webp`)
- **Serialization, Config & Time**: `serde` (`1`), `serde_json` (`1`, `preserve_order`, `raw_value`), `chrono` (`0.4`), `time` (`0.3`), `uuid` (`1`, `v4`), `dotenvy` (`0.15`)
- **Logging**: `tracing` (`0.1`), `tracing-subscriber` (`0.3`, `env-filter`, `fmt`), `tracing-appender` (`0.2`)

### Frontend (`frontend/package.json`)
- **Framework & Routing**: `react` (`19`), `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/react-form`
- **HTTP, Auth & Validation**: `axios`, `better-auth` (frontend client/compat), `zod`
- **State, i18n & UI**: `zustand`, `i18next` / `react-i18next`, `@base-ui/react`, `lucide-react`, `echarts`, `sonner`, `date-fns`, Tailwind CSS

---

## 1. PostgreSQL & Better Auth Standards

### PostgreSQL + SeaORM (`src/db/`)
- **Config**: Reads `DATABASE_URL` or `POSTGRES_HOST` / `POSTGRES_PORT` / `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` (with fallback to `../backend/.env`).
- **Pool Settings (`src/db/mod.rs`)**: `max_connections(4)`, `min_connections(1)`, `connect_timeout(5s)`, `idle_timeout(5s)`, `sqlx_logging(false)` — tuned for low-memory VPS deployments.
- **Data Access**: Use SeaORM entities in `src/db/entities/<domain>/` (e.g., `src/db/entities/course/`, `src/db/entities/exam/`, re-exported in `src/db/entities/mod.rs`) for standard CRUD and transactions; use `Statement::from_sql_and_values` for complex read/aggregation queries.

### Better Auth Compatibility (`src/modules/auth/` & `src/middleware/auth.rs`)
- **Tables**: Uses the shared Better Auth PostgreSQL schema (`users`, `users_accounts`, `users_sessions`, `users_profiles`, `users_verifications`).
- **Password Hashing**: `scrypt`-based hashes compatible with `better-auth@1.7.3` (`src/modules/auth/crypto.rs`).
- **Session Extraction**: Accepts either:
  - Signed cookie `${COOKIE_PREFIX}.session_token` (HMAC-SHA256 verified with `BETTER_AUTH_SECRET`), or
  - `Authorization: Bearer <token>` header.
- **Extractors**: Use `AuthSession` for authenticated endpoints and `RequireAdmin` (`user.role == "admin"`) for admin endpoints.
- **Session Cache**: Backed by `moka::future::Cache` (`session_cache` in `AppState`, 60s TTL). Always invalidate on sign-out, session revoke, password change, profile update, or avatar update.

---

## 2. Directory Blueprint

```text
backend-rust/
├── Cargo.toml                         # Dependencies (axum, sea-orm, moka, tracing-appender, etc.)
├── build.rs                           # Generates LocaleKey enum from locales/id/*.json at compile time
├── locales/
│   ├── id/*.json                      # Source of truth & default locale (compile-time checked by build.rs)
│   └── en/*.json                      # English overrides
└── src/
    ├── main.rs                        # dotenvy, tracing (stdout + daily file), connect_db, AppState, shutdown
    ├── app.rs                         # Router assembly, CORS, rate limit, slow_request_logger, ServeDir
    ├── config/mod.rs                  # AppConfig & LogConfig from env
    ├── error/mod.rs                   # AppError (400/401/403/404/409/422/500) -> { success: false, message }
    ├── middleware/auth.rs             # AuthSession & RequireAdmin Axum extractors
    ├── types/response.rs              # ApiResponse<T>, ErrorResponse, PaginationMeta
    ├── db/entities/                   # SeaORM entities grouped by domain (<domain>/mod.rs + <table>.rs, re-exported in mod.rs)
    ├── platform/storage.rs            # Local disk & S3/R2 file storage helpers
    ├── modules/<domain>/
    │   ├── mod.rs
    │   ├── types.rs                   # Serde input/output DTOs (#[serde(rename_all = "camelCase")])
    │   └── services/                  # 1 File = 1 Service
    │       ├── mod.rs
    │       └── <action>.rs
    └── routes/<domain>/               # 1 File = 1 Route
        ├── mod.rs                     # Router::new().route(...)
        └── <action>.rs                # pub async fn handler(...)

frontend/src/
├── constants/app-api.ts               # Centralized API endpoint URL map
├── lib/fetch-api.ts                   # Shared HTTP client (axios wrapper, credentials, error normalization)
├── locales/                           # Frontend i18n translations (i18next)
├── routes/                            # 1 File = 1 Page Route (TanStack Router file-based routing)
├── api/
│   ├── types.ts                       # Shared BaseResponse & PaginationMeta
│   └── <domain>/
│       ├── types.ts                   # Shared domain DTOs/enums + re-exports of endpoint types
│       ├── index.ts                   # Re-exports TanStack hooks
│       └── <endpoint>.ts              # 1 File = 1 API Endpoint (TanStack hook + Request/Response types)
└── features/<domain>/
    └── <feature>/                     # Components, hooks, tables, dialogs, local UI types
```

---

## 3. `backend-rust` Rules

1. **1 File = 1 Route (`src/routes/<domain>/...`)**
   - Export `pub async fn handler(...) -> Result<impl IntoResponse, AppError>` and wire it in `mod.rs`.
   - Use `AuthSession` for authenticated routes and `RequireAdmin` for admin routes.
   - Return `ApiResponse::ok(msg, data)` or `ApiResponse::msg(msg)` from `src/types/response.rs` (never duplicate response envelope structs).
2. **1 File = 1 Service (`src/modules/<domain>/services/...`)**
   - Keep handlers thin (extractors, validation, calling service, returning `ApiResponse`).
   - Put DB queries, SeaORM transactions, and business logic in `services/<action>.rs`.
   - Use `#[serde(rename_all = "camelCase")]` on DTOs in `types.rs` so JSON matches TypeScript conventions.
3. **Compile-Time Typed Locales (`locales/id/*.json`)**
   - Add new translation keys to `locales/id/<domain>.json` (and `locales/en/<domain>.json`).
   - `build.rs` generates `LocaleKey` at compile time — use `locale.t(LocaleKey::...)` in handlers or `locales::tr(LocaleKey::...)` in services.
4. **Caching & Logging**
   - Use `moka::future::Cache` in `AppState` for hot read paths and session caching (invalidate on mutations).
   - Use `tracing::warn!` / `tracing::error!` for actionable issues (written to daily `../logs/api-issues.YYYY-MM-DD.log` when `LOG_SAVE_TO_FILE=true`).

---

## 4. `frontend` Rules (Decoupled from `backend/`)

1. **1 File = 1 API Endpoint & 1 File = 1 Route**
   - Keep **1 file per API endpoint** under `frontend/src/api/<domain>/<endpoint>.ts` (matching `backend-rust`'s `1 File = 1 Route` layout), exporting its TanStack Query/Mutation hook and endpoint-specific request/response types.
   - Keep **1 file per page route** under `frontend/src/routes/` (TanStack Router file-based routing).
2. **Zero `backend/` Imports**
   - Never import types or values from `backend/src/*`.
   - Use `BaseResponse` and `PaginationMeta` from `@/api/types` (`frontend/src/api/types.ts`).
3. **Define Endpoint Types Once, Re-export via `types.ts`**
   - Define endpoint-specific request/response interfaces directly in `frontend/src/api/<domain>/<endpoint>.ts` right next to `fetchApi(...)`.
   - Use `BaseResponse` directly for endpoints that only return `{ success, message }` (avoid creating redundant type aliases like `type FooResponse = BaseResponse`).
   - Keep shared domain DTOs/enums (e.g., `AuthUser`, `EnumUserRole`, `AdminCoinItem`) in `frontend/src/api/<domain>/types.ts`, and re-export the endpoint types from the files in that folder (`export type { ... } from "./<endpoint>"`) so routes/components have a single clean domain import path.
4. **Verify Rust Parity**
   - Always cross-check field names (`camelCase`), nullability (`Option<T>` → `T | null`), and status/response shapes against `backend-rust/src/modules/<domain>/types.rs`.

---

## 5. Verification Checklist

Every phase/feature MUST pass **both** API-level and Frontend Browser E2E verification before being marked complete:

1. **Backend Build & Unit Tests**: `cd backend-rust && cargo check && cargo test`
2. **Frontend Typecheck**: `cd frontend && bunx tsc --noEmit` (and `bun run build` before deploy)
3. **API Smoke & CRUD Tests (`curl` + Postgres)**:
   - Test every added/updated endpoint (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), including full CRUD lifecycles (Create → Read → Update → Delete), file uploads (`multipart/form-data`), RBAC (`401`/`403` for non-admin on `RequireAdmin` routes), and `moka` cache invalidation.
   - Clean up temporary test rows/users from Postgres after the run.
4. **Frontend Chrome Browser E2E & CRUD Tests**:
   - Point `frontend` at `backend-rust` and verify every affected page in Chrome (via CDP `connect` mode) with **0 page errors**.
   - Test full **UI CRUD** through the actual frontend forms/dialogs/tables (not just Read/List): submit Create forms, verify new items appear in tables/lists, submit Edit/Update forms, verify changes persist, and trigger Delete actions, verifying items are removed.
   - Clean up any temporary test accounts/records created during browser testing.
