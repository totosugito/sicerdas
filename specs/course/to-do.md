# Course Module To-Do & Architecture Notes

This document tracks the implementation roadmap and key architectural decisions for the Course Module, specifically focusing on its integration with the CBT Exam Engine.

## 🏗 Architectural Decision: The Hidden Course Package Strategy

The Course Engine creates **private, hidden exam packages** for its EXAM lectures. These packages use a dedicated `examType` value (`course_exam`) and are **invisible** in the public exam listing. Users can only access them through the course UI.

This eliminates the cross-module synchronization problem entirely — since sessions can only be created from one entry point (the course), there is no ambiguity about progress tracking.

### 1. CBT Engine Owns the Grading (Source of Truth)
- When a user takes a course exam, they generate an `exam_session` against the hidden course package.
- The CBT engine scrambles questions, enforces timers, grades the attempt, and saves the final `score` and `status: COMPLETED` in `exam_sessions`.

### 2. Course Engine Owns the Progression
- Course progression rules (like passing scores) are stored in `course_lectures.extra` JSONB.
  ```json
  { "successThreshold": 75 }
  ```
  - The `sectionId` of the hidden `course_exam` section is stored in `course_lectures.referenceUrl`.
  - The `packageId` is derived from `exam_package_sections.packageId` when needed (e.g., for `POST /exam/sessions/user/start`).
  - Each EXAM lecture maps to exactly **1 section**. Multi-section exams create multiple lectures grouped under a course chapter.
  - `successThreshold` is a **percentage (0–100)**. Evaluation formula: `(exam_session.earnedPoints / exam_session.maxPoints * 100) >= successThreshold`.
- **The Evaluation Flow**: 
  When a user finishes an exam, the frontend calls `POST /course/lectures/:id/complete`. The Course API checks the CBT `exam_sessions` table for the highest completed score. If `highest_score >= successThreshold`, the lecture is marked as `isCompleted: true` in `course_user_progress`.

### 3. Dashboard Score Snapshotting
- To prevent heavy cross-module database queries when loading the course syllabus UI, the user's best score is snapshotted into the `course_user_progress.extra` JSONB field once they pass.
  ```json
  { "examSessionId": "session-456", "finalScore": 80.00 }
  ```

### 4. Why Hidden Packages (Not Linking Public Ones)

| Problem with linking public packages | Hidden package solution |
|:--------------------------------------|:------------------------|
| User finishes exam from standalone Exam menu → Course doesn't know | Impossible — package is hidden, only accessible from course |
| Need to sync progress bidirectionally | No sync needed — single entry point |
| Cross-module JOIN queries on dashboard load | Avoided via score snapshotting |

### 5. Cloning Public Exam Content
- If an instructor wants to reuse questions from an existing public tryout (e.g., "Tryout UTBK"), the backend **clones the package structure** (package → sections → question links) into a new hidden `course_exam` package.
- The underlying `exam_questions` are shared (not duplicated) — only the container (`exam_packages`, `exam_package_sections`, `exam_package_questions`) is cloned.

---

## ✅ Completed Tasks (Schema & Spec Alignment)

1. **Enum Fix**: Added `EXAM: 'exam'` to `EnumLectureType` in `course/enums.ts` to properly identify heavy exams.
2. **Unique Constraints**: Added `uniqueIndex` to prevent duplicate rows in:
   - `course_enrollments (courseId, userId)`
   - `course_user_progress (userId, courseId, lectureId)`
   - `course_user_stats_category (userId, categoryId)`
3. **Lectures Docstring Cleaned**: Removed 6 phantom quiz fields from `lectures.ts` and redirected documentation to the CBT Engine bridge strategy.
4. **Lectures TS Typings**: Strongly typed the `course_lectures.extra` field in Drizzle to provide TS autocomplete for `successThreshold`.
5. **CBT Randomization Control**: 
   - Added `isRandomItem` and `isRandomChoice` boolean toggles to `exam_package_sections` schema.
   - Updated Admin Package Section API (schemas, create, update, detail) to support these fields.
   - Updated the Frontend `DialogSectionForm` to allow instructors to toggle question/option randomization.
   - Updated `start-session.service.ts` to respect these toggles when generating session answers.

---

## 🚀 To-Do: Course API Implementation Roadmap

Currently, there are no API routes or services for the Course module. The following endpoints need to be built:

### Phase 0: Exam Module Preparation
- [ ] Add `COURSE_EXAM: 'course_exam'` to `EnumExamType` in `exam/enums.ts`
- [ ] Update `start-session.service.ts` to allow `course_exam` type in the `or()` access check (line 41-44)
- [ ] Verify public listing (`POST /exam/packages/list`) already filters by `examType = 'official'` (confirmed — no changes needed)

### Phase 1: Core Course Management (Admin)
- [ ] `POST /course/admin/create` — Create draft course
- [ ] `PUT /course/admin/update/:id` — Update course metadata
- [ ] `GET /course/admin/list` — List all courses (with filters)
- [ ] `GET /course/admin/detail/:id` — Full course detail including nested chapters and lectures

### Phase 2: Content Management (Admin)
- [ ] Chapter CRUD (`create`, `update`, `delete`, `reorder`)
- [ ] Lecture CRUD (`create`, `update`, `delete`, `reorder`)
  - *Must support configuring `successThreshold` in `extra` for EXAM types.*

### Phase 2.5: Course Exam Package Generator (Admin)
- [ ] **EXAM package generator**: When saving an EXAM lecture, auto-create a hidden exam package (`examType: 'course_exam'`). Each section becomes its own lecture with `sectionId` in `referenceUrl`.
- [ ] **Clone public package**: Service to clone an existing public exam package's structure (package → sections → question links) into a new hidden `course_exam` package. Each cloned section becomes its own lecture.

### Phase 3: Public & User Flows
- [ ] `GET /course/list` — Public course catalog
- [ ] `GET /course/detail/:id` — Course preview page
- [ ] `POST /course/enroll` — User enrolls in a course (checks tier requirements via `courses.requiredTier`, same pattern as `exam_packages.required_tier`)
- [ ] `GET /course/dashboard/:id` — User's active view of the course (includes progress snapshot)

### Phase 4: The Progression Bridge
- [ ] `POST /course/lectures/:id/complete` — The endpoint called when a user finishes a video or submits an exam.
  - *For Videos/Text/PDF*: Just mark `isCompleted = true`.
  - *For Exams*: 
    1. Read `sectionId` from `course_lectures.referenceUrl`. Derive `packageId` from `exam_package_sections`.
    2. Query `exam_sessions` for the highest completed score: `MAX(earnedPoints/maxPoints*100) WHERE status = 'completed' AND sectionId = X AND userId = Y`.
    3. Compare against `successThreshold`.
    4. If passed: update `course_user_progress.isCompleted = true` and snapshot score to `extra`.

### Phase 5: Statistics & Background Jobs
- [ ] Create cron jobs/triggers to update `course_stats` and `course_user_stats_global` incrementally.
- [ ] Define detailed schema for course stats tables (what metrics to aggregate: enrollment count, completion rate, average scores, etc.).
