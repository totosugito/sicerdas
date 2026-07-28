# Course Module API Specifications

This document outlines the required API endpoints and routers for the Course Module. The architecture is heavily inspired by the existing `exam` module, separating concerns into specific sub-modules (`courses`, `chapters`, `lectures`, `lecture-texts`, `enrollments`, `user-progress`, `interactions`, `user-stats`).

---

## 1. `courses` Router (Target: `src/modules/course/courses` & `src/routes/course/courses`)
Handles the high-level course metadata, catalog, and admin CRUD.

### Admin Services (`/course/courses/admin`)
- [x] `POST /create`: Create a new draft course (required: courseCode, courseName, categoryId, educationGradeId)
- [x] `PUT /update/:id`: Update course metadata (title, description, tags, pricing, grade, etc.)
- [x] `DELETE /delete/:id`: Delete a course (cleans up course directory & thumbnail storage)
- [x] `GET /list`: List all courses (with filters: status, categoryId, categoryKey, educationGradeId, educationGradeIds, search)
- [x] `GET /detail/:id`: Full course detail (returns resolved thumbnail URL)
- [x] `PATCH /thumbnail/:id`: Upload or remove course thumbnail (?action=remove to delete)

### Public/User Services (`/course/courses`)
- [x] `GET /list`: Public course catalog (filters: categoryId, categoryKey, educationGradeId, educationGradeIds, search)
- [x] `GET /detail/:id`: Course preview page

---

## 2. `chapters` Router (Target: `src/modules/course/chapters` & `src/routes/course/chapters`)
Handles the structural modules/sections within a course.

### Admin Services (`/course/chapters/admin`)
- [x] `GET /list/:courseId`: List chapters for a specific course
- [x] `GET /detail/:id`: Chapter detail
- [x] `POST /create`: Create a new chapter
- [x] `PUT /update/:id`: Update chapter title/description
- [x] `DELETE /delete/:id`: Delete chapter
- [x] `PUT /reorder/:courseId`: Bulk update chapter positions (fractional indexing)

---

## 3. `lectures` Router (Target: `src/modules/course/lectures` & `src/routes/course/lectures`)
Handles atomic content items. (`referenceUrl` stores `course_lecture_texts.id` for `TEXT` type lectures, `sectionId` for `EXAM` type lectures, or CDN/file URLs for media).

### Admin Services (`/course/lectures/admin`)
- [x] `GET /list/:chapterId`: List all lectures in a chapter
- [x] `GET /detail/:id`: Full lecture detail (including `referenceUrl` and `extra` JSONB)
- [x] `POST /create`: Create a new lecture
- [x] `PUT /update/:id`: Update lecture (title, description, type, referenceUrl, extra)
- [x] `DELETE /delete/:id`: Delete lecture
- [x] `PUT /reorder/:chapterId`: Bulk update lecture positions

### Admin Exam Package Generators
- [ ] `POST /generate-exam/:id`: Generates a hidden `course_exam` package for the lecture and saves the `sectionId` to `referenceUrl`.
- [ ] `POST /clone-exam/:id`: Clones an existing public exam package into a hidden `course_exam` and creates corresponding lectures.

---

## 4. `lecture-texts` Router (Target: `src/modules/course/lecture-texts` & `src/routes/course/lecture-texts`)
Handles standalone, reusable rich text articles (BlockNote JSON format) referenced by `TEXT` type lectures.

### Admin Services (`/course/lecture-texts/admin`)
- [x] `GET /list`: List all course lecture text articles (supports search/title filter for dropdown selection)
- [x] `GET /detail/:id`: Full detail of a course lecture text article
- [x] `POST /create`: Create a new course lecture text article
- [x] `PUT /update/:id`: Update course lecture text title & BlockNote content
- [x] `DELETE /delete/:id`: Delete course lecture text article

---

## 5. `enrollments` Router (Target: `src/modules/course/enrollments` & `src/routes/course/enrollments`)
Handles the 1:1 relationship between users and courses.

### Admin Services (`/course/enrollments/admin`)
- [ ] `GET /list/:courseId`: List all enrolled students in a course
- [ ] `POST /add`: Manually enroll a student (e.g., bypassing payment)
- [ ] `DELETE /remove`: Drop a student from a course

### User Services (`/course/enrollments`)
- [ ] `POST /enroll/:courseId`: User enrolls in a course (checks `requiredTier`)
- [ ] `GET /active`: List user's ACTIVE courses
- [ ] `GET /completed`: List user's COMPLETED courses

---

## 6. `user-progress` Router (Target: `src/modules/course/user-progress` & `src/routes/course/user-progress`)
Handles tracking granular lecture completion.

### User Services (`/course/user-progress`)
- [ ] `GET /syllabus/:courseId`: Returns the full course syllabus (chapters + lectures) combined with the user's progress (`isCompleted`, `watchTimeSeconds`, etc.)
- [ ] `POST /lecture/:lectureId/complete`: **The Progression Bridge**.
  - For Videos/PDFs: Mark as completed.
  - For EXAMs: Fetch CBT `exam_sessions` score, compare with `successThreshold`.
- [ ] `PUT /lecture/:lectureId/watch-time`: Incremental updates for video watch time.

---

## 7. `interactions` Router (Target: `src/modules/course/interactions` & `src/routes/course/interactions`)
Handles user ratings and bookmarks (tied to `course_enrollments`).

### User Services (`/course/interactions`)
- [ ] `POST /rating/:courseId`: Add or update a 1-5 star rating
- [ ] `POST /bookmark/:courseId`: Toggle bookmark status
- `POST /like/:courseId`: Toggle like/dislike status
- [ ] `GET /favorites`: List bookmarked/liked courses

---

## 8. `user-stats` Router (Target: `src/modules/course/user-stats` & `src/routes/course/user-stats`)
Handles user dashboard analytics.

### User Services (`/course/user-stats`)
- [ ] `GET /global`: Fetch `course_user_stats_global` (total enrolled, total completed, watch time)
- [ ] `GET /categories`: Fetch `course_user_stats_category` (progress segmented by category)

---

## File Structure Template

Just like the Exam module, each sub-module follows:
```text
# Domain module logic:
src/modules/course/[domain]/
├── index.ts                # Service re-exports & Fastify schemas
├── [domain].schema.ts      # Fastify validation schemas (TypeBox)
└── services/
    ├── admin/              # Admin logic
    └── user/               # Public/User logic

# Autoloaded routes:
src/routes/course/[domain]/
├── admin/                  # Admin endpoints (protected by admin.hook.ts)
└── [user-route].ts         # User/Public endpoints
```
