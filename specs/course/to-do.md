# Course Module To-Do & Architecture Notes

This document tracks the implementation roadmap and key architectural decisions for the Course Module, specifically focusing on its integration with the CBT Exam Engine.

## 🏗 Architectural Decision: The Two-Tiered Bridge Strategy

The Course Engine delegates all complex quiz and exam logic (randomization, item banks, IRT grading) to the CBT Exam Engine. The two engines are connected via `course_lectures.referenceUrl` pointing to an `exam_packages.id` (or section ID).

### 1. CBT Engine Owns the Grading (Source of Truth)
- When a user takes a course quiz, they generate an `exam_session`.
- The CBT engine scrambles questions, enforces timers, grades the attempt, and saves the final `score` and `status: COMPLETED` in `exam_sessions`.

### 2. Course Engine Owns the Progression
- Course progression rules (like passing scores or retries) are stored in `course_lectures.extra` JSONB.
  ```json
  { "successThreshold": 75, "maxRetries": 3 }
  ```
- **The Evaluation Flow**: 
  When a user finishes an exam, the Course API checks the CBT `exam_sessions` table for the highest completed score. If `highest_score >= successThreshold`, the lecture is marked as `isCompleted: true` in `course_user_progress`.

### 3. Dashboard Score Snapshotting
- To prevent heavy cross-module database queries when loading the course syllabus UI, the user's best score is snapshotted into the `course_user_progress.extra` JSONB field once they pass.
  ```json
  { "examSessionId": "session-456", "finalScore": 80.00 }
  ```

---

## ✅ Completed Tasks (Schema & Spec Alignment)

1. **Enum Fix**: Added `EXAM: 'exam'` to `EnumLectureType` in `course/enums.ts` to properly identify heavy exams.
2. **Unique Constraints**: Added `uniqueIndex` to prevent duplicate rows in:
   - `course_enrollments (courseId, userId)`
   - `course_user_progress (userId, courseId, lectureId)`
   - `course_user_stats_category (userId, categoryId)`
3. **Lectures Docstring Cleaned**: Removed 6 phantom quiz fields from `lectures.ts` and redirected documentation to the CBT Engine bridge strategy.
4. **Lectures TS Typings**: Strongly typed the `course_lectures.extra` field in Drizzle to provide TS autocomplete for `successThreshold` and `maxRetries`.
5. **CBT Randomization Control**: 
   - Added `isRandomItem` and `isRandomChoice` boolean toggles to `exam_package_sections` schema.
   - Updated Admin Package Section API (schemas, create, update, detail) to support these fields.
   - Updated the Frontend `DialogSectionForm` to allow instructors to toggle question/option randomization.
   - Updated `start-session.service.ts` to respect these toggles when generating session answers.

---

## 🚀 To-Do: Course API Implementation Roadmap

Currently, there are no API routes or services for the Course module. The following endpoints need to be built:

### Phase 1: Core Course Management (Admin)
- [ ] `POST /course/admin/create` — Create draft course
- [ ] `PUT /course/admin/update/:id` — Update course metadata
- [ ] `GET /course/admin/list` — List all courses (with filters)
- [ ] `GET /course/admin/detail/:id` — Full course detail including nested chapters and lectures

### Phase 2: Content Management (Admin)
- [ ] Chapter CRUD (`create`, `update`, `delete`, `reorder`)
- [ ] Lecture CRUD (`create`, `update`, `delete`, `reorder`)
  - *Must support configuring `successThreshold` in `extra` for QUIZ/EXAM types.*

### Phase 3: Public & User Flows
- [ ] `GET /course/list` — Public course catalog
- [ ] `GET /course/detail/:id` — Course preview page
- [ ] `POST /course/enroll` — User enrolls in a course (checks tier requirements)
- [ ] `GET /course/dashboard/:id` — User's active view of the course (includes progress snapshot)

### Phase 4: The Progression Bridge
- [ ] `POST /course/lectures/:id/complete` — The endpoint called when a user finishes a video or submits a quiz.
  - *For Videos*: Just mark `isCompleted = true`.
  - *For Quizzes*: Fetch CBT score, compare against `successThreshold`, update `isCompleted`, and snapshot score to `extra`.

### Phase 5: Statistics & Background Jobs
- [ ] Create chron jobs/triggers to update `course_stats` and `course_user_stats_global` incrementally.
