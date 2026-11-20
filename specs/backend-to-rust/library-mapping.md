# Library Mapping: Fastify / Node.js → Rust

Complete replacement mapping for dependencies in [backend/package.json](file:///home/toto/Documents/sicerdas/backend/package.json).

---

## 1. Web Framework & HTTP Middleware

| Fastify / Node Package | Rust Crate | Notes |
| :--- | :--- | :--- |
| `fastify` (`^5.12.3`) | `axum` (`0.8`) + `tokio` (`1`) | Async HTTP router & handlers built on `hyper` + `tower` |
| `@fastify/autoload` | Manual `Router::nest(...)` | Explicit module routers in `src/routes/<domain>/mod.rs` |
| `@fastify/cors` | `tower-http` (`cors` feature) | `CorsLayer` with trusted origins + credentials |
| `@fastify/compress` | `tower-http` (`compression-gzip`) | Gzip compression above 1 KB |
| `@fastify/static` | `tower-http` (`fs` feature) | `ServeDir` for `/uploads/` with `Cross-Origin-Resource-Policy: cross-origin` |
| `@fastify/helmet` | `tower-http` (`set-header`) | Security headers |
| `@fastify/cookie` | `axum-extra` (`0.10`, `cookie` feature) | `CookieJar` |
| `@fastify/multipart` | `axum` (`multipart` feature) | Built-in `Multipart` extractor (11 MB body limit) |
| `@fastify/rate-limit` | `tower_governor` | Per-IP rate limiting + `retry-after` |
| `@fastify/under-pressure` | Custom health/load middleware | Or `tower::limit::ConcurrencyLimitLayer` |
| `@fastify/sensible` | Custom `AppError` (`IntoResponse`) | Maps errors to `400`/`401`/`403`/`404`/`409`/`422`/`500` `{ success: false, message }` |
| `close-with-grace` | `tokio::signal` + `axum::serve(...).with_graceful_shutdown(...)` | Built-in graceful shutdown |

---

## 2. Validation, OpenAPI & i18n

| Fastify / Node Package | Rust Crate | Notes |
| :--- | :--- | :--- |
| `@sinclair/typebox` + `@fastify/type-provider-typebox` | `serde` (`1`) + `validator` | Typed request/response DTOs (`#[serde(rename_all = "camelCase")]`) |
| `@scalar/fastify-api-reference` | `utoipa` + `utoipa-axum` + `utoipa-scalar` | Optional OpenAPI 3.1 generation + Scalar UI |
| `fastify-i18n` | `build.rs` typed `LocaleKey` | Compile-time checked `locales/id/*.json` (12 domain files, `id` default) + `locales/en/*.json` |

---

## 3. Database, Auth & Caching

| Fastify / Node Package | Rust Crate | Notes |
| :--- | :--- | :--- |
| `drizzle-orm` + `pg` + `drizzle-kit` | `sea-orm` (`1.1`, `sqlx-postgres`, `runtime-tokio-rustls`) | ORM entities, transactions, pagination; `Statement::from_sql_and_values` for complex aggregations |
| `better-auth` (`^1.7.4`) | Native `axum` + `sea-orm` + `scrypt` + `hmac` + `sha2` | Compatible with existing `users`, `users_accounts`, `users_sessions`, `users_profiles`, `users_verifications` tables and `better-auth` `scrypt` password hashes & signed session cookies |
| In-memory version/read caches | `moka` (`0.12`, `future` feature) | Async in-memory TTL cache with single-flight coalescing (`try_get_with`) |

---

## 4. Storage, Images, Email & Rich Text

| Fastify / Node Package | Rust Crate | Notes |
| :--- | :--- | :--- |
| `@aws-sdk/client-s3` | `aws-sdk-s3` (`1`) + `aws-config` (`1`) | Works with AWS S3 and Cloudflare R2 (`USE_S3_STORAGE`) |
| `sharp` | `image` (`0.25`, `jpeg`, `png`, `webp`) | Pure Rust image decoding/resizing (avatars, course thumbnails) |
| `@getbrevo/brevo` + `axios` | `reqwest` (`json` feature) | Async HTTP client for **Resend** transactional email REST API (`POST https://api.resend.com/emails`, replacing Brevo), PDF proxy (`book/proxy-pdf`), and Google OAuth verification |
| `@blocknote/core`, `@blocknote/server-util`, `yjs`, `y-prosemirror` | `serde_json` (`raw_value`) + custom Rust JSON/HTML helper | Exam questions/solutions and course `lecture_texts` store BlockNote JSON in PostgreSQL `jsonb`; store/validate as structured JSON and render minimal HTML only where needed (e.g. `blocknote-utils.ts` export/preview) |
| `mathjs` | `meval` or `fasteval` (if server-side eval needed) | Check if actually called in active routes before porting |

---

## 5. Logging, Config & Utilities

| Fastify / Node Package | Rust Crate | Notes |
| :--- | :--- | :--- |
| `env-schema` + `dotenv` | `dotenvy` (`0.15`) + typed `AppConfig` | Reads `.env` / `../backend/.env` fallback |
| `pino` + `pino-roll` | `tracing` + `tracing-subscriber` + `tracing-appender` | Structured logs to stdout + daily rolling file (`LOG_SAVE_TO_FILE=true`) |
| `date-fns` | `chrono` (`0.4`) / `time` (`0.3`) | Date/time math & ISO-8601 formatting |
| `uuid` | `uuid` (`1`, `v4`, `serde`) | UUID generation & serialization |
