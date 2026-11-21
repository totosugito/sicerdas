# Phase 6: Frontend Decoupling from Legacy `backend/`

**Goal:** Remove all compile-time and runtime dependencies from `frontend/` on the legacy `backend/` folder (`tsconfig.json` `"backend/*"` path alias, `vite.config.ts` `"backend"` resolve alias, and **52 files** in `frontend/src/` importing from `backend/*`), defining self-contained TypeScript types in `frontend/src/api/` that match `backend-rust`.

---

## Inventory of Current `frontend/` → `backend/` References

Verified across `frontend/src/` (52 files total):

| Location | File Count | Target in `backend/` |
| :--- | :--- | :--- |
| `frontend/tsconfig.json:20` | — | Path alias `"backend/*": ["../backend/*"]` |
| `frontend/vite.config.ts:43-45` | — | Resolve alias `find: "backend"` → `../backend/` |
| `frontend/src/api/types.ts` | 1 | `BaseResponse`, `PaginationMeta` |
| `frontend/src/api/auth/*` | 1 | `backend/src/modules/auth/*` |
| `frontend/src/api/users/*` | 3 | `backend/src/modules/users/*`, `EnumUserRole` (`backend/src/db/schema/users/types`) |
| `frontend/src/api/tier/*` | 2 | `backend/src/modules/tier/*` |
| `frontend/src/api/version/*` | 4 | `backend/src/modules/version/*` |
| `frontend/src/api/education/*` | 6 | `backend/src/modules/education/*` |
| `frontend/src/api/book/*` | 1 | `backend/src/modules/book/*` |
| `frontend/src/api/content-report/*` | 1 | `backend/src/modules/content-report/*` |
| `frontend/src/api/periodic-table/*` | 1 | `backend/src/modules/periodic-table/*` |
| `frontend/src/api/course/*` | 11 | `backend/src/modules/course/*` |
| `frontend/src/api/exam/*` | 19 | `backend/src/modules/exam/*`, `backend/src/db/schema/exam/enums` |
| `frontend/src/routes/(pages)/*` | 2 | Direct `backend/` imports in page routes |

---

## Step 6.1: Shared Base Types, Auth & Users
- [x] **6.1.1** Define `BaseResponse` and `PaginationMeta` directly in `frontend/src/api/types.ts` (matching `backend-rust/src/types/response.rs`).
- [x] **6.1.2** Decouple `frontend/src/api/auth/types.ts` from `backend/src/modules/auth/*`.
- [x] **6.1.3** Decouple `frontend/src/api/users/*` (3 files), defining `EnumUserRole` locally in `frontend/src/api/users/types.ts`.
- [x] **6.1.4** Verify with `cd frontend && bunx tsc --noEmit`.

---

## Step 6.2: Tier, Version, Education, Book, Content Report, Periodic Table & Pages
- [x] **6.2.1** Decouple `frontend/src/api/tier/*` (2 files).
- [x] **6.2.2** Decouple `frontend/src/api/version/*` (4 files).
- [x] **6.2.3** Decouple `frontend/src/api/education/*` (6 files).
- [x] **6.2.4** Decouple `frontend/src/api/book/*` (1 file), `content-report/*` (1 file), `periodic-table/*` (1 file), and `routes/(pages)/*` (2 files).
- [x] **6.2.5** Verify with `cd frontend && bunx tsc --noEmit`.

---

## Step 6.3: Course (`course/*`)
- [x] **6.3.1** Decouple all 11 files in `frontend/src/api/course/` (courses, chapters, lectures, lecture-texts, enrollments, user-progress, user-stats), cross-checking DTOs against `backend-rust/src/modules/course/*/types.rs`.
- [x] **6.3.2** Verify with `cd frontend && bunx tsc --noEmit`.

---

## Step 6.4: Exam (`exam/*`) & Alias Removal
- [x] **6.4.1** Define exam enums locally in `frontend/src/api/exam/types.ts` (replacing `backend/src/db/schema/exam/enums`).
- [x] **6.4.2** Decouple all remaining 18 files in `frontend/src/api/exam/` (subjects, passages, questions, question-options, question-solutions, question-tags, packages, package-sections, package-questions, sessions, user-stats).
- [x] **6.4.3** Remove `"backend/*": ["../backend/*"]` from `frontend/tsconfig.json`.
- [x] **6.4.4** Remove the `"backend"` resolve alias from `frontend/vite.config.ts`.
- [x] **6.4.5** Verify zero remaining imports from `"backend/"` (`grep -rn "backend/" frontend/src/` returns empty).
- [x] **6.4.6** Run full frontend typecheck & build: `cd frontend && bunx tsc --noEmit && bun run build`.
