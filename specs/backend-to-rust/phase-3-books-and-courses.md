# Phase 3: Books & Courses

**Goal:** Migrate the Book library and Course LMS domains (**52 routes total**), including PDF proxying, thumbnail uploads, BlockNote JSON lecture content, user enrollments, and progress/stats tracking.

---

## 1. Books (`src/routes/book/` — 12 routes)

### Public (`book/*` — 5 routes)
- `list-book.ts` (paginated list with category/grade/group filters)
- `detail-book.ts`
- `filter-params.ts`
- `update-download.ts` (guest/content counter window using `CONTENT_COUNTER_WINDOW_MS`)
- `proxy-pdf.ts` (streams remote/S3 PDF via `reqwest` with proper `Content-Type: application/pdf` and range/CORS headers)

### User (`book/user/*` — 5 routes, `AuthSession`)
- `bookmark.ts`, `favorites.ts`, `history.ts`, `rating.ts`, `stats.ts`

### Admin (`book/admin/*` — 2 routes, `RequireAdmin`)
- `update-group-stats.ts`, `update-all-group-stats.ts`

---

## 2. Courses (`src/routes/course/` — 40 routes)

### Courses (`course/courses/*` — 15 routes)
- Public (4): `list-course.ts`, `detail-course.ts`, `filter-params.ts`, `structure-course.ts`
- User (`course/courses/user/*` — 4, `AuthSession`): `bookmark.ts`, `favorites.ts`, `like.ts`, `rating.ts`
- Admin (`course/courses/admin/*` — 7, `RequireAdmin`): `list-course.ts`, `detail-course.ts`, `structure-course.ts`, `create-course.ts`, `update-course.ts`, `delete-course.ts`, `thumbnail-course.ts` (multipart image upload + resize via `image` crate + local/S3 storage)

### Chapters (`course/chapters/admin/*` — 6 routes, `RequireAdmin`)
- `list-chapter.ts`, `detail-chapter.ts`, `create-chapter.ts`, `update-chapter.ts`, `delete-chapter.ts`, `reorder-chapter.ts`

### Lectures (`course/lectures/admin/*` — 6 routes, `RequireAdmin`)
- `GET /api/course/lectures/admin/list/:chapterId` (`list-lecture.ts`)
- `GET /api/course/lectures/admin/detail/:id` (`detail-lecture.ts`)
- `POST /api/course/lectures/admin/create` (`create-lecture.ts`)
- `PUT /api/course/lectures/admin/update/:id` (`update-lecture.ts`)
- `DELETE /api/course/lectures/admin/delete/:id` (`delete-lecture.ts`)
- `PUT /api/course/lectures/admin/reorder/:chapterId` (`reorder-lecture.ts`)

### Lecture Texts (`course/lecture-texts/admin/*` — 6 routes, `RequireAdmin`)
- Stores/serves BlockNote JSON (`jsonb`) in PostgreSQL via `serde_json::Value` / `RawValue`.
- `GET /api/course/lecture-texts/admin/list` (`list-lecture-text.ts`)
- `GET /api/course/lecture-texts/admin/list-simple` (`list-simple-lecture-text.ts`)
- `GET /api/course/lecture-texts/admin/detail/:id` (`detail-lecture-text.ts`)
- `POST /api/course/lecture-texts/admin/create` (`create-lecture-text.ts`)
- `PUT /api/course/lecture-texts/admin/update/:id` (`update-lecture-text.ts`)
- `DELETE /api/course/lecture-texts/admin/delete/:id` (`delete-lecture-text.ts`)

### Enrollments, Progress & Stats (`AuthSession` — 7 routes)
- **Enrollments (`course/enrollments/user/*` — 3 routes):**
  - `POST /api/course/enrollments/user/enroll/:courseId` (`enroll.ts`)
  - `GET /api/course/enrollments/user/active` (`active.ts`)
  - `GET /api/course/enrollments/user/completed` (`completed.ts`)
- **User Progress (`course/user-progress/user/*` — 2 routes):**
  - `GET /api/course/user-progress/user/syllabus/:courseId` (`syllabus.ts`)
  - `POST /api/course/user-progress/user/lecture/:lectureId/complete` (`complete.ts`) — lecture completion + course progress recalculation in SeaORM transaction
- **User Stats (`course/user-stats/user/*` — 2 routes):**
  - `GET /api/course/user-stats/user/global` (`global.ts`)
  - `GET /api/course/user-stats/user/categories` (`categories.ts`)

---

## 3. Phase 3 Acceptance Criteria
- [x] All 12 `book/*` routes pass parity checks, including `proxy-pdf` streaming and user bookmark/rating/history.
- [x] All 40 `course/*` routes pass parity checks, including chapter/lecture reordering, BlockNote `lecture-texts` JSON round-tripping, thumbnail upload, and enrollment/progress transactions.
