# API Parity Report: Legacy Fastify (`backend`) vs Rust (`backend-rust`)

**Test Date:** 2026-11-21  
**Target:** `http://127.0.0.1:5550` against PostgreSQL `sicerdas` (`localhost:5432`)  
**Summary:** **55 / 72** exact status + keys + nested JSON shape matches; **11** `SHAPE DIFF` (all `200` with matching `frontend/` TypeScript DTOs); **6** `STATUS/KEY DIFF` (4 incomplete-body validation `400`/`422` + 2 endpoints where `backend-rust` succeeded `200` while Fastify returned `403`/`404`).

---

## Frontend Type & Runtime Compatibility Check
- `cd frontend && bunx tsc --noEmit && bun run build`: **0 errors** (`8,643` modules built in `2.98s`), **0** `backend/` imports, **0** duplicate API type aliases.
- All 11 `SHAPE DIFF` endpoints were cross-checked against `frontend/src/api/*/types.ts`:
  - `GET /api/auth/get-session`, `GET /api/users/user/sessions-list`, `GET /api/book/detail/{bookId}`, `GET /api/course/user-stats/user/global`: identical keys; diff is only `null` vs scalar on nullable fields.
  - `GET /api/periodic-table/element/1`: `backend-rust` returns `data.atomicIsotope` as `Record<string, AtomicIsotopeItem>`, matching [ElementData](file:///home/toto/Documents/sicerdas/frontend/src/api/periodic-table/types.ts#L65-L77) and [ElementIsotope.tsx](file:///home/toto/Documents/sicerdas/frontend/src/features/periodic-table/element-isotope/ElementIsotope.tsx#L26-L35).
  - `POST /api/exam/packages/admin/list` & `GET /api/exam/packages/admin/detail/{id}`: `backend-rust` returns `categoryId`, `educationGradeId`, `totalSections`, `activeSections`, `totalQuestions`, `activeQuestions`, matching [AdminPackageItem](file:///home/toto/Documents/sicerdas/frontend/src/api/exam/packages/types.ts#L65-L88).
  - `POST /api/exam/package-sections/admin/list` & `GET /api/exam/package-sections/admin/detail/{id}`: `backend-rust` returns `maxScore` and `parentPackageId` (`educationGradeId?` optional), matching [AdminSectionItemT](file:///home/toto/Documents/sicerdas/frontend/src/api/exam/package-sections/types.ts#L20-L42).
  - `POST /api/book/list`: `description` omitted when `NULL` (`description?: string` in [BookListItemData](file:///home/toto/Documents/sicerdas/frontend/src/api/book/types.ts#L32-L54)).
  - `GET /api/book/user/history`: `backend-rust` includes additive `stats.bookmarkCount` (non-breaking).

---

## Full 72-Endpoint Comparison Table

| # | Endpoint | Fastify | Rust | Parity |
| ---: | :--- | :--- | :--- | :--- |
| 1 | `GET /api/health` | `200` (11.1ms) | `200` (2.1ms) | EXACT MATCH |
| 2 | `GET /api/health/live` | `200` (1.6ms) | `200` (1.4ms) | EXACT MATCH |
| 3 | `GET /api/health/ready` | `200` (1.9ms) | `200` (1.0ms) | EXACT MATCH |
| 4 | `GET /api/auth/get-session` | `200` (16.6ms) | `200` (2.0ms) | SHAPE DIFF |
| 5 | `POST /api/app/app-latest` | `400` (2.2ms) | `422` (1.2ms) | STATUS/KEY DIFF |
| 6 | `GET /api/app/book-info?appVersion=1.0.0` | `400` (2.4ms) | `400` (0.7ms) | STATUS/KEY DIFF |
| 7 | `GET /api/app/dictionary-data` | `200` (1.8ms) | `200` (0.7ms) | EXACT MATCH |
| 8 | `GET /api/app/periodic-data` | `200` (637.2ms) | `200` (693.7ms) | EXACT MATCH |
| 9 | `GET /api/app/periodic-table` | `200` (42.3ms) | `200` (46.6ms) | EXACT MATCH |
| 10 | `POST /api/version/list` | `200` (16.0ms) | `200` (3.2ms) | EXACT MATCH |
| 11 | `POST /api/version/list-simple` | `400` (2.0ms) | `422` (1.4ms) | STATUS/KEY DIFF |
| 12 | `GET /api/version/admin/detail/{id}` | `200` (12.2ms) | `200` (1.6ms) | EXACT MATCH |
| 13 | `GET /api/tier/app-tier` | `200` (4.0ms) | `200` (1.6ms) | EXACT MATCH |
| 14 | `GET /api/tier/admin/list-tier` | `200` (4.7ms) | `200` (1.5ms) | EXACT MATCH |
| 15 | `GET /api/tier/admin/{slug}` | `200` (6.3ms) | `200` (1.5ms) | EXACT MATCH |
| 16 | `GET /api/periodic-table/element/1` | `200` (6.9ms) | `200` (2.4ms) | SHAPE DIFF |
| 17 | `GET /api/ai/model/admin/models/stats` | `200` (7.0ms) | `200` (2.6ms) | EXACT MATCH |
| 18 | `GET /api/users/user/details` | `200` (34.8ms) | `200` (1.7ms) | EXACT MATCH |
| 19 | `GET /api/users/user/sessions-list` | `200` (7.4ms) | `200` (1.6ms) | SHAPE DIFF |
| 20 | `POST /api/users/admin/list` | `200` (11.6ms) | `200` (1.8ms) | EXACT MATCH |
| 21 | `GET /api/users/admin/stats` | `200` (5.6ms) | `200` (2.0ms) | EXACT MATCH |
| 22 | `GET /api/users/admin/{id}` | `200` (14.2ms) | `200` (1.5ms) | EXACT MATCH |
| 23 | `POST /api/education/categories/list` | `200` (8.3ms) | `200` (2.1ms) | EXACT MATCH |
| 24 | `POST /api/education/categories/list-simple` | `200` (3.6ms) | `200` (1.7ms) | EXACT MATCH |
| 25 | `POST /api/education/grades/list` | `200` (7.3ms) | `200` (1.5ms) | EXACT MATCH |
| 26 | `POST /api/education/grades/list-simple` | `200` (3.5ms) | `200` (1.1ms) | EXACT MATCH |
| 27 | `POST /api/education/tags/list` | `200` (7.9ms) | `200` (2.1ms) | EXACT MATCH |
| 28 | `POST /api/education/tags/list-simple` | `200` (2.9ms) | `200` (1.2ms) | EXACT MATCH |
| 29 | `GET /api/education/tags/detail/{id}` | `200` (5.6ms) | `200` (1.3ms) | EXACT MATCH |
| 30 | `GET /api/book/filter-params` | `200` (3.8ms) | `200` (2.0ms) | EXACT MATCH |
| 31 | `POST /api/book/list` | `200` (22.7ms) | `200` (17.4ms) | SHAPE DIFF |
| 32 | `GET /api/book/detail/{bookId}` | `200` (9.8ms) | `200` (7.7ms) | SHAPE DIFF |
| 33 | `GET /api/book/user/favorites` | `200` (6.2ms) | `200` (4.0ms) | EXACT MATCH |
| 34 | `GET /api/book/user/history` | `200` (6.7ms) | `200` (3.6ms) | SHAPE DIFF |
| 35 | `GET /api/book/user/stats` | `200` (4.2ms) | `200` (1.8ms) | EXACT MATCH |
| 36 | `GET /api/course/courses/filter-params` | `200` (3.1ms) | `200` (2.3ms) | EXACT MATCH |
| 37 | `POST /api/course/courses/list` | `200` (7.2ms) | `200` (3.8ms) | EXACT MATCH |
| 38 | `POST /api/course/courses/admin/list` | `200` (6.2ms) | `200` (3.2ms) | EXACT MATCH |
| 39 | `GET /api/course/courses/user/favorites` | `200` (4.3ms) | `200` (2.3ms) | EXACT MATCH |
| 40 | `GET /api/course/enrollments/user/active` | `200` (4.5ms) | `200` (2.5ms) | EXACT MATCH |
| 41 | `GET /api/course/enrollments/user/completed` | `200` (3.7ms) | `200` (1.7ms) | EXACT MATCH |
| 42 | `GET /api/course/lecture-texts/admin/list` | `200` (4.7ms) | `200` (1.8ms) | EXACT MATCH |
| 43 | `GET /api/course/lecture-texts/admin/list-simple` | `200` (4.1ms) | `200` (2.0ms) | EXACT MATCH |
| 44 | `GET /api/course/user-stats/user/categories` | `200` (3.4ms) | `200` (1.8ms) | EXACT MATCH |
| 45 | `GET /api/course/user-stats/user/global` | `200` (5.8ms) | `200` (1.7ms) | SHAPE DIFF |
| 46 | `POST /api/exam/subjects/list` | `200` (8.0ms) | `200` (1.6ms) | EXACT MATCH |
| 47 | `POST /api/exam/subjects/list-simple` | `200` (2.9ms) | `200` (1.8ms) | EXACT MATCH |
| 48 | `GET /api/exam/subjects/detail/{id}` | `200` (6.3ms) | `200` (1.0ms) | EXACT MATCH |
| 49 | `GET /api/exam/packages/filter-params` | `200` (2.5ms) | `200` (1.8ms) | EXACT MATCH |
| 50 | `POST /api/exam/packages/list` | `200` (6.5ms) | `200` (3.3ms) | EXACT MATCH |
| 51 | `POST /api/exam/packages/admin/list` | `200` (17.6ms) | `200` (2.7ms) | SHAPE DIFF |
| 52 | `POST /api/exam/packages/admin/list-simple` | `200` (4.1ms) | `200` (1.3ms) | EXACT MATCH |
| 53 | `GET /api/exam/packages/admin/detail/{id}` | `200` (14.5ms) | `200` (1.9ms) | SHAPE DIFF |
| 54 | `POST /api/exam/package-questions/admin/list` | `200` (10.3ms) | `200` (3.7ms) | EXACT MATCH |
| 55 | `POST /api/exam/packages/user/favorites` | `404` (1.6ms) | `200` (3.1ms) | STATUS/KEY DIFF |
| 56 | `POST /api/exam/package-sections/admin/list` | `200` (13.0ms) | `200` (2.2ms) | SHAPE DIFF |
| 57 | `POST /api/exam/package-sections/admin/list-simple` | `200` (4.3ms) | `200` (1.9ms) | EXACT MATCH |
| 58 | `GET /api/exam/package-sections/admin/detail/{id}` | `200` (8.9ms) | `200` (1.2ms) | SHAPE DIFF |
| 59 | `POST /api/exam/passages/admin/list` | `200` (4.6ms) | `200` (1.7ms) | EXACT MATCH |
| 60 | `POST /api/exam/passages/admin/list-simple` | `200` (3.4ms) | `200` (1.4ms) | EXACT MATCH |
| 61 | `POST /api/exam/questions/admin/list` | `200` (19.0ms) | `200` (2.7ms) | EXACT MATCH |
| 62 | `POST /api/exam/questions/admin/list-simple` | `200` (10.3ms) | `200` (1.8ms) | EXACT MATCH |
| 63 | `GET /api/exam/questions/admin/detail/{id}` | `200` (20.6ms) | `200` (2.6ms) | EXACT MATCH |
| 64 | `POST /api/exam/question-options/admin/list` | `200` (4.3ms) | `200` (1.7ms) | EXACT MATCH |
| 65 | `POST /api/exam/question-solutions/admin/list` | `200` (7.2ms) | `200` (1.6ms) | EXACT MATCH |
| 66 | `POST /api/exam/question-tags/admin/list` | `200` (3.3ms) | `200` (1.2ms) | EXACT MATCH |
| 67 | `POST /api/exam/sessions/history` | `400` (1.5ms) | `422` (0.9ms) | STATUS/KEY DIFF |
| 68 | `GET /api/exam/leaderboard/user/list` | `200` (4.1ms) | `200` (1.4ms) | EXACT MATCH |
| 69 | `GET /api/exam/user-stats/activity` | `200` (3.3ms) | `200` (1.5ms) | EXACT MATCH |
| 70 | `GET /api/exam/user-stats/global` | `200` (6.2ms) | `200` (1.1ms) | EXACT MATCH |
| 71 | `GET /api/exam/user-stats/tags` | `200` (4.2ms) | `200` (1.8ms) | EXACT MATCH |
| 72 | `POST /api/auth/sign-out` | `403` (12.3ms) | `200` (1.7ms) | STATUS/KEY DIFF |
