# Phase 2: Users, Tiers, App/Version, Education & Core Metadata

**Goal:** Migrate user management, subscription tiers, app/version metadata, education taxonomy, content reports, periodic table, and AI model config endpoints (**56 routes total**) with full JSON and behavior parity.

---

## 1. Users (`src/routes/users/` — 17 routes)

### User Self-Service (`users/user/*` — 7 routes, `AuthSession`)
- `GET /api/users/user/details` (`details-user.ts`)
- `PUT /api/users/user/update-profile` (`update-profile.ts`) — invalidates `session_cache`
- `PUT /api/users/user/change-password` (`change-password.ts`) — verifies current `scrypt` hash, writes new `scrypt` hash, invalidates `session_cache`
- `PATCH /api/users/user/avatar` (`avatar-user.ts`) — multipart upload (max 2 MB, JPEG/PNG/WebP), resized via `image` crate, saved to local `/uploads/` or S3/R2 (`USE_S3_STORAGE`), invalidates `session_cache`
- `GET /api/users/user/sessions-list` (`sessions-list.ts`)
- `POST /api/users/user/multi-session-revoke` (`multi-session-revoke.ts`) — invalidates `session_cache`
- `POST /api/users/user/revoke-other-sessions-v1` (`revoke-other-sessions-v1.ts`) — invalidates `session_cache`

### User Admin (`users/admin/*` — 10 routes, `RequireAdmin`)
- `POST /api/users/admin/list` (`list-users.ts`)
- `GET /api/users/admin/details` / `:id` (`details-user.ts`)
- `POST /api/users/admin/create` (`create-user.ts`)
- `PUT /api/users/admin/update` (`update-user.ts`)
- `DELETE /api/users/admin/delete` (`delete-user.ts`)
- `POST /api/users/admin/deletes` (`deletes.ts`)
- `POST /api/users/admin/ban` (`ban.ts`) — invalidates user sessions
- `POST /api/users/admin/reset-password` (`reset-password.ts`)
- `PATCH /api/users/admin/avatar` (`avatar.ts`)
- `GET /api/users/admin/stats` (`stats-user.ts`)

---

## 2. Tiers (`src/routes/tier/` — 6 routes)
- Public/App: `GET /api/tier/app-tier` (`app-tier.ts`)
- Admin (`RequireAdmin`): `list-tier`, `details-tier`, `create-tier`, `update-tier`, `delete-tier` (`tier/admin/*` — 5 routes)

---

## 3. App & Version (`src/routes/app/` — 5 routes, `src/routes/version/` — 6 routes)
- **App (`app/*`):** `app-latest.ts`, `book-info.ts`, `dictionary-data.ts`, `periodic-data.ts`, `periodic-table.ts` (cache hot read responses in `moka` where appropriate).
- **Version (`version/*`):** `list-version.ts`, `list-version-simple.ts`, plus `version/admin/*` (4 routes: `create-version`, `update-version`, `delete-version`, `detail-version`). Invalidate version `moka` cache on admin mutations (replacing `app.versionCache`).

---

## 4. Education Taxonomy (`src/routes/education/` — 16 routes)
- **Categories (`education/categories/*` — 5 routes):**
  - `POST /api/education/categories/list` (`list-category.ts`)
  - `POST /api/education/categories/list-simple` (`list-category-simple.ts`)
  - `POST /api/education/categories/admin/create` (`admin/create-category.ts`, `RequireAdmin`)
  - `PUT /api/education/categories/admin/update/:id` (`admin/update-category.ts`, `RequireAdmin`)
  - `DELETE /api/education/categories/admin/delete/:id` (`admin/delete-category.ts`, `RequireAdmin`)
- **Grades (`education/grades/*` — 5 routes):**
  - `POST /api/education/grades/list` (`list-grade.ts`)
  - `POST /api/education/grades/list-simple` (`list-grade-simple.ts`)
  - `POST /api/education/grades/admin/create` (`admin/create-grade.ts`, `RequireAdmin`)
  - `PUT /api/education/grades/admin/update/:id` (`admin/update-grade.ts`, `RequireAdmin`)
  - `DELETE /api/education/grades/admin/delete/:id` (`admin/delete-grade.ts`, `RequireAdmin`)
- **Tags (`education/tags/*` — 6 routes):**
  - `POST /api/education/tags/list` (`list-tag.ts`)
  - `POST /api/education/tags/list-simple` (`list-tag-simple.ts`)
  - `GET /api/education/tags/detail/:id` (`detail-tag.ts`)
  - `POST /api/education/tags/admin/create` (`admin/create-tag.ts`, `RequireAdmin`)
  - `PUT /api/education/tags/admin/update/:id` (`admin/update-tag.ts`, `RequireAdmin`)
  - `DELETE /api/education/tags/admin/delete/:id` (`admin/delete-tag.ts`, `RequireAdmin`)

---

## 5. Content Report, Periodic Table & AI Models (6 routes)
- **Content Report (`content-report/*` — 1 route):** `POST /api/content-report/create` (`create-report.ts`)
- **Periodic Table (`periodic-table/*` — 1 route):** `element.ts`
- **AI Models (`ai/model/admin/*` — 4 routes, `RequireAdmin`):** `create-model.ts`, `details-model.ts`, `models-stats.ts`, `update-model.ts`

---

## 6. Phase 2 Acceptance Criteria
- [x] All 17 `users/*` routes pass parity checks (including avatar upload/resize and session cache invalidation).
- [x] All 6 `tier/*`, 5 `app/*`, 6 `version/*`, 16 `education/*`, 1 `content-report/*`, 1 `periodic-table/*`, and 4 `ai/model/*` routes return matching JSON shapes and `PaginationMeta`.
- [x] Version/App `moka` caches invalidate cleanly on admin create/update/delete.
- [x] Verified via `cargo test` (`4 passed`), `scripts/smoke-phase2.sh` (`passed=56 failed=0`, including `RequireAdmin` `403` checks), and Chrome E2E (`/periodic-table` + Hydrogen detail, `/users/profile`, `/users/admin/list-users`).
