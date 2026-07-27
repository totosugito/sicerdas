# Exam Module API Progress

Last Updated: July 2026

## Overview

We are building a comprehensive Exam & Practice Question module for the Sicerdas application backend (Fastify + Drizzle ORM). The database schema involves multiple interconnected tables to support flexible questions (multiple-choice or other types) tied to categories, subjects, and topics (tags), spanning different subscription tiers and education grades.

All API endpoints are built following the conventions found in `app-tier/admin`, specifically utilizing:

- `@sinclair/typebox` for schema validation
- `withErrorHandler` wrapper for centralized error handling
- Multi-language support (Locales) primarily initialized with Indonesian strings in `src/locales/id/exam.json`

## Known Architectural Decisions

- **Paging/Listing API Strategy:** We opted to use `POST` instead of `GET` for the list endpoints. This pattern allows us to cleanly accept complex JSON validation through TypeBox body objects (such as robust nested filter conditions) which are difficult to parse in standard query strings.
- **Locales First:** Any string returned directly to the user/admin UI is strictly mapped against `src/locales/id/exam.json` through the Fastify `i18n` handler.
- **Cascade Controls:** Deep deletion checks are relegated to PostgreSQL's native `CASCADE` or `RESTRICT` depending on data safety. Specifically, deleting an `exam_question` safely cascades and rips out options/solutions to avoid orphan queries. Evaluated `RESTRICT` on packages so users don't mysteriously lose test records.

---

## Phase 1–4: Core Content Management (Admin) ✅

The foundational content components of the exam module have been built. Full CRUD (Create, Read/List, Update, Delete) capability is implemented for all primary definition tables.

### Subjects (`exam_subjects`)

- Schema: Includes `isActive` boolean.
- [x] POST `/exam/admin/subjects/create`
- [x] POST `/exam/admin/subjects/list`
- [x] PUT `/exam/admin/subjects/update/:id`
- [x] DELETE `/exam/admin/subjects/delete/:id`

### Tags / Topics (`education_tags`)

- Schema: Includes `isActive` and `updatedAt`. Located in `education/`.
- [x] POST `/exam/admin/tags/create`
- [x] POST `/exam/admin/tags/list` (Supports pagination and name/description search; Includes `totalQuestions` count)
- [x] PUT `/exam/admin/tags/update/:id`
- [x] DELETE `/exam/admin/tags/delete/:id`

### Passages (`exam_passages`)

- Schema: Includes `isActive` boolean. Maintains denormalized `totalQuestions` and `activeQuestions` counters.
- [x] POST `/exam/admin/passages/create`
- [x] POST `/exam/admin/passages/list` (Supports pagination and title text search)
- [x] PUT `/exam/admin/passages/update/:id`
- [x] DELETE `/exam/admin/passages/delete/:id`

### Questions (`exam_questions`)

- Schema: Links to `subjectId`, `passageId` (optional), `educationGradeId` (optional). Contains deep JSONB `content`. Supports `maxScore`, `scoringStrategy`, and `variableFormulas`.
- Deletion Constraint: Built with cascading deletes for children (Options/Solutions are deleted synchronously when the parent question is deleted).
- [x] POST `/exam/admin/questions/create`
- [x] POST `/exam/admin/questions/list` (Detailed filters including difficulty, tier, subject, and grade; Includes `totalOptions` count and `tags` array)
- [x] PUT `/exam/admin/questions/update/:id`
- [x] DELETE `/exam/admin/questions/delete/:id`

### Question Options (`exam_question_options`)

- Schema: Includes `isActive`, `createdAt`, `updatedAt`, per-option `score`.
- [x] POST `/exam/admin/question-options/create`
- [x] POST `/exam/admin/question-options/list`
- [x] PUT `/exam/admin/question-options/update/:id`
- [x] DELETE `/exam/admin/question-options/delete/:id`
- [x] POST `/exam/admin/question-options/deletes` (Bulk delete)

### Question Solutions (`exam_question_solutions`)

- Schema: Includes `isActive`. Links to specific `solutionType` (general, fast_method, tips, video_link).
- [x] POST `/exam/admin/question-solutions/create`
- [x] POST `/exam/admin/question-solutions/list`
- [x] PUT `/exam/admin/question-solutions/update/:id`
- [x] DELETE `/exam/admin/question-solutions/delete/:id`
- [x] POST `/exam/admin/question-solutions/deletes` (Bulk delete)

### Question Tags (`exam_question_tags`)

- Schema: Junction between Questions and Tags.
- [x] POST `/exam/admin/question-tags/assign` (Bulk assign tags to a question)
- [x] POST `/exam/admin/question-tags/unassign` (Bulk remove tags from a question)
- [x] POST `/exam/admin/question-tags/list` (List tags for a question or vice versa)

---

## Phase 5: Packages & Sections (Admin) ✅

Full admin CRUD for assembling exam packages, their sections, and linking questions.

### Packages (`exam_packages`) — Admin

- Schema: Includes `required_tier`, `education_grade_id`, `thumbnail`, `versionId`, denormalized counters (`totalSections`, `activeSections`, `totalQuestions`, `activeQuestions`).
- [x] POST `/exam/admin/packages/create`
- [x] POST `/exam/admin/packages/list` (Full admin list with filters)
- [x] POST `/exam/admin/packages/list-simple` (Lightweight dropdown list)
- [x] GET `/exam/admin/packages/detail/:id`
- [x] PUT `/exam/admin/packages/update/:id`
- [x] DELETE `/exam/admin/packages/delete/:id`
- [x] POST `/exam/admin/packages/thumbnail/:id` (Upload/manage thumbnail)

### Package Sections (`exam_package_sections`) — Admin

- Schema: Includes `groupName`, `description`, `maxScore`, `versionId`, `questionLimit`, denormalized counters.
- [x] POST `/exam/admin/package-sections/create`
- [x] POST `/exam/admin/package-sections/list` (Full admin list)
- [x] POST `/exam/admin/package-sections/list-simple` (Lightweight dropdown list)
- [x] GET `/exam/admin/package-sections/detail/:id`
- [x] PUT `/exam/admin/package-sections/update/:id`
- [x] DELETE `/exam/admin/package-sections/delete/:id`

### Package Questions (`exam_package_questions`) — Admin

- Schema: Junction table linking questions to packages with mandatory `sectionId`.
- [x] POST `/exam/admin/package-questions/assign`
- [x] POST `/exam/admin/package-questions/unassign`
- [x] POST `/exam/admin/package-questions/list`
- [x] POST `/exam/admin/package-questions/sync-order`

---

## Phase 6: Public Package Listing & User Interactions ✅

Public-facing package discovery and user engagement features.

### Packages — Public

- [x] POST `/exam/packages/list` (Public listing with education grade/category filters)
- [x] GET `/exam/packages/detail/:id` (Public package detail)
- [x] GET `/exam/packages/filter-params` (Pre-aggregated filter parameters)

### Packages — User Interactions

- [x] POST `/exam/packages/user/bookmark` (Toggle bookmark)
- [x] POST `/exam/packages/user/favorites` (List bookmarked/favorited packages)
- [x] POST `/exam/packages/user/rating` (Submit/update rating)
- [x] POST `/exam/packages/user/generate-custom` (Generate custom practice package)
- [x] POST `/exam/packages/user/list-custom` (List user's custom practices)

### Package Sections — Public

- [x] POST `/exam/package-sections/list` (Public section listing for a package)

---

## Phase 7: CBT Session Engine (User) ✅

The core Computer-Based Test engine supporting study and tryout modes with full session lifecycle.

### Sessions (`exam_sessions`) — User

- Schema: Section-scoped sessions with `mode` (study/tryout), `elapsedSeconds`, `isTimerActive`, denormalized result stats, `isAnswersPurged`.
- [x] POST `/exam/sessions/user/start` (Start new or resume in-progress session)
- [x] POST `/exam/sessions/user/save-answer` (Autosave answer with `selectedOptionId`, `textAnswer`, `isDoubtful`)
- [x] POST `/exam/sessions/user/submit` (Complete and grade the session)
- [x] POST `/exam/sessions/user/abandon` (Forfeit session with partial grading)
- [x] POST `/exam/sessions/user/history` (Paginated past attempts per section)
- [x] GET `/exam/sessions/user/details/:id` (Lightweight session metadata + navigation grid)
- [x] GET `/exam/sessions/user/question/:id/:questionId` (Lazy-loaded question content with secure solution evaluation)
- [x] POST `/exam/sessions/user/all` (List all user sessions across packages)

---

## Phase 8: Analytics & Gamification (User) ✅

Incremental aggregation-based user statistics and leaderboard.

### User Stats

- [x] GET `/exam/user-stats/global` (Lifetime dashboard aggregate)
- [x] GET `/exam/user-stats/subjects` (Per-subject accuracy radar)
- [x] GET `/exam/user-stats/tags` (Per-tag granular accuracy)
- [x] GET `/exam/user-stats/activity` (Activity/streak tracking)

### Leaderboard

- [x] POST `/exam/leaderboard/user/list` (Ranked leaderboard)
