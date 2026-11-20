# Phase 4: Exam Engine & Daily Scheduled Jobs

**Goal:** Migrate the entire Exam engine (**73 routes** across 12 sub-groups) and the **8 daily maintenance/stats jobs** from `backend/src/scripts/schedule/daily/jobs/`.

---

## 1. Exam Routes (`src/routes/exam/` — 72 active routes; `exam/leaderboard/index.ts` is empty)

### Content & Authoring
- **Subjects (`exam/subjects/*` — 6 routes):**
  - Public: `POST /api/exam/subjects/list` (`list-subject.ts`), `POST /api/exam/subjects/list-simple` (`list-subject-simple.ts`), `GET /api/exam/subjects/detail/:id` (`detail-subject.ts`)
  - Admin (`RequireAdmin`): `POST /api/exam/subjects/admin/create` (`admin/create.ts`), `PUT /api/exam/subjects/admin/update/:id` (`admin/update.ts`), `DELETE /api/exam/subjects/admin/delete/:id` (`admin/delete.ts`)
- **Passages (`exam/passages/admin/*` — 6 routes, `RequireAdmin`):**
  - `POST /api/exam/passages/admin/list` (`list-passage.ts`), `POST /api/exam/passages/admin/list-simple` (`list-passage-simple.ts`), `GET /api/exam/passages/admin/detail/:id` (`detail.ts`), `POST /api/exam/passages/admin/create` (`create.ts`), `PUT /api/exam/passages/admin/update/:id` (`update.ts`), `DELETE /api/exam/passages/admin/delete/:id` (`delete.ts`)
- **Questions (`exam/questions/admin/*` — 6 routes, `RequireAdmin`):**
  - `POST /api/exam/questions/admin/list` (`list.ts`), `POST /api/exam/questions/admin/list-simple` (`list-simple.ts`), `GET /api/exam/questions/admin/detail/:id` (`detail.ts`), `POST /api/exam/questions/admin/create` (`create.ts`), `PUT /api/exam/questions/admin/update/:id` (`update.ts`), `DELETE /api/exam/questions/admin/delete/:id` (`delete.ts`) — BlockNote JSON stored in `jsonb`
- **Question Options (`exam/question-options/admin/*` — 5 routes, `RequireAdmin`):**
  - `POST /api/exam/question-options/admin/list` (`list.ts`), `POST /api/exam/question-options/admin/create` (`create.ts`), `PUT /api/exam/question-options/admin/update/:id` (`update.ts`), `DELETE /api/exam/question-options/admin/delete/:id` (`delete.ts`), `POST /api/exam/question-options/admin/deletes` (`deletes.ts`)
- **Question Solutions (`exam/question-solutions/admin/*` — 5 routes, `RequireAdmin`):**
  - `POST /api/exam/question-solutions/admin/list` (`list.ts`), `POST /api/exam/question-solutions/admin/create` (`create.ts`), `PUT /api/exam/question-solutions/admin/update/:id` (`update.ts`), `DELETE /api/exam/question-solutions/admin/delete/:id` (`delete.ts`), `POST /api/exam/question-solutions/admin/deletes` (`deletes.ts`)
- **Question Tags (`exam/question-tags/admin/*` — 4 routes, `RequireAdmin`):**
  - `POST /api/exam/question-tags/admin/list` (`list.ts`), `POST /api/exam/question-tags/admin/assign` (`assign.ts`), `POST /api/exam/question-tags/admin/assign-by-names` (`assign-by-names.ts`), `POST /api/exam/question-tags/admin/unassign` (`unassign.ts`)

### Packages & Sections
- **Packages (`exam/packages/*` — 16 routes):**
  - Public (3): `POST /api/exam/packages/list` (`list-package.ts`), `GET /api/exam/packages/detail/:id` (`detail-package.ts`), `GET /api/exam/packages/filter-params` (`filter-params.ts`)
  - User (`AuthSession`, 5): `GET /api/exam/packages/user/favorites` (`user/favorites.ts`), `GET /api/exam/packages/user/list-custom` (`user/list-custom.ts`), `POST /api/exam/packages/user/bookmark` (`user/bookmark.ts`), `POST /api/exam/packages/user/generate-custom` (`user/generate-custom.ts`), `POST /api/exam/packages/user/rating` (`user/rating.ts`)
  - Admin (`RequireAdmin`, 8): `POST /api/exam/packages/admin/list` (`admin/list-package.ts`), `POST /api/exam/packages/admin/list-simple` (`admin/list-package-simple.ts`), `GET /api/exam/packages/admin/detail/:id` (`admin/detail-package.ts`), `POST /api/exam/packages/admin/create` (`admin/create.ts`), `PUT /api/exam/packages/admin/update/:id` (`admin/update.ts`), `DELETE /api/exam/packages/admin/delete/:id` (`admin/delete.ts`), `POST /api/exam/packages/admin/clone` (`admin/clone.ts`), `PATCH /api/exam/packages/admin/thumbnail/:id` (`admin/thumbnail.ts`)
- **Package Sections (`exam/package-sections/*` — 7 routes):**
  - Public (1): `POST /api/exam/package-sections/list` (`list-section.ts`)
  - Admin (`RequireAdmin`, 6): `POST /api/exam/package-sections/admin/list` (`admin/list-section.ts`), `POST /api/exam/package-sections/admin/list-simple` (`admin/list-section-simple.ts`), `GET /api/exam/package-sections/admin/detail/:id` (`admin/detail-section.ts`), `POST /api/exam/package-sections/admin/create` (`admin/create.ts`), `PUT /api/exam/package-sections/admin/update/:id` (`admin/update.ts`), `DELETE /api/exam/package-sections/admin/delete/:id` (`admin/delete.ts`)
- **Package Questions (`exam/package-questions/admin/*` — 4 routes, `RequireAdmin`):**
  - `POST /api/exam/package-questions/admin/list` (`list.ts`), `POST /api/exam/package-questions/admin/assign` (`assign.ts`), `POST /api/exam/package-questions/admin/unassign` (`unassign.ts`), `POST /api/exam/package-questions/admin/sync-order` (`sync-order.ts`)

### Exam Runtime, Leaderboard & Stats
- **Sessions (`exam/sessions/*` — 8 routes, `AuthSession`):**
  - `POST /api/exam/sessions/start` (`start.ts`), `GET /api/exam/sessions/:id/questions/:questionId` (`question.ts`), `POST /api/exam/sessions/save-answer` (`save-answer.ts`), `POST /api/exam/sessions/submit/:id` (`submit.ts`), `POST /api/exam/sessions/abandon/:id` (`abandon.ts`), `GET /api/exam/sessions/details/:id` (`details.ts`), `POST /api/exam/sessions/history` (`history.ts`), `POST /api/exam/sessions/all` (`all.ts`)
  - Ensure `submit` and `save-answer` run inside SeaORM transactions (`db.begin()`) to keep scores, timers, and `user_stats_*` consistent.
- **Leaderboard (`exam/leaderboard/user/*` — 1 active route, `AuthSession`):**
  - `GET /api/exam/leaderboard/user/list` (`user/list.ts`) (candidate for short-TTL `moka` cache; `exam/leaderboard/index.ts` is an empty file).
- **User Stats (`exam/user-stats/*` — 4 routes, `AuthSession`):**
  - `GET /api/exam/user-stats/global` (`global.ts`), `POST /api/exam/user-stats/subjects` (`subjects.ts`), `GET /api/exam/user-stats/tags` (`tags.ts`), `GET /api/exam/user-stats/activity` (`activity.ts`).

---

## 2. Exam Sync & BlockNote Notes
- Check `backend/src/services/exam/sync-*.ts` (`sync-package.ts`, `sync-section.ts`, `sync-passage.ts`, `sync-question.ts`) to see if any admin endpoints invoke bulk sync or if they are CLI-only scripts.
- BlockNote JSON (`backend/src/utils/blocknote/blocknote-utils.ts`): Validate/preserve JSON structure in Rust with `serde_json::Value` / `RawValue`; port HTML conversion only if an active HTTP endpoint requires server-rendered HTML.

---

## 3. Daily Scheduled Jobs (`backend/src/scripts/schedule/daily/jobs/`)
Port the 8 daily jobs as `backend-rust` CLI subcommands (e.g. `backend-rust job <name>` or `backend-rust job daily-all`) so systemd/cron can invoke them without Node/Bun:
1. `archive-guest-events` (`GUEST_EVENT_WINDOW_MS`)
2. `clean-stale-sessions` (`EXAM_STALE_SESSION_DAYS`, default 30)
3. `compute-course-stats`
4. `compute-exam-stats`
5. `purge-old-exam-answers` (`EXAM_ANSWERS_RETENTION_DAYS`, default 365)
6. `reconcile-exam-stats`
7. `update-book-stats`
8. `update-user-stats`

---

## 4. Phase 4 Acceptance Criteria
- [ ] All 73 `exam/*` routes pass parity checks, including full exam lifecycle (`start` → `question` → `save-answer` → `submit` → `details` → `user-stats` / `leaderboard`).
- [ ] All 8 daily jobs run cleanly via `backend-rust` CLI and produce identical DB state updates to the TypeScript scripts.
