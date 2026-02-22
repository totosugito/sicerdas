# Exam Module API Progress

Date: February 2026

## Overview

We are building a comprehensive Exam & Practice Question module for the Sicerdas application backend (Fastify + Drizzle ORM). The database schema involves multiple interconnected tables to support flexible questions (multiple-choice or other types) tied to categories, subjects, and topics (tags), spanning different subscription tiers and education grades.

All new API endpoints are built following the conventions found in `app-tier/admin`, specifically utilizing:
- `@sinclair/typebox` for schema validation
- `withErrorHandler` wrapper for centralized error handling
- Multi-language support (Locales) primarily initialized with Indonesian strings in `src/locales/id/exam.json`

## Phase 1 to 4: Content Management (Admin)

The foundational content components of the exam module have been built. We have successfully implemented full CRUD (Create, Read/List, Update, Delete) capability for all primary definition tables.

### Finished APIs

- **Categories (`exam_categories`)**
  - Schema: Includes soft-hide `isActive` boolean.
  - Endpoints:
    - [x] POST `/exam/admin/categories/create`
    - [x] POST `/exam/admin/categories/list` (Supports pagination and filtering)
    - [x] PUT `/exam/admin/categories/update/:id`
    - [x] DELETE `/exam/admin/categories/delete/:id`

- **Subjects (`exam_subjects`)**
  - Schema: Includes `isActive` boolean.
  - Endpoints:
    - [x] POST `/exam/admin/subjects/create`
    - [x] POST `/exam/admin/subjects/list`
    - [x] PUT `/exam/admin/subjects/update/:id`
    - [x] DELETE `/exam/admin/subjects/delete/:id`

- **Tags / Topics (`exam_tags`)**
  - Schema: Includes `isActive` and `updatedAt` boolean.
  - Endpoints:
    - [x] POST `/exam/admin/tags/create`
    - [x] POST `/exam/admin/tags/list`
    - [x] PUT `/exam/admin/tags/update/:id`
    - [x] DELETE `/exam/admin/tags/delete/:id`

- **Passages (`exam_passages`)**
  - Schema: Added `isActive` boolean.
  - Endpoints:
    - [x] POST `/exam/admin/passages/create`
    - [x] POST `/exam/admin/passages/list` (Supports pagination and title text search)
    - [x] PUT `/exam/admin/passages/update/:id`
    - [x] DELETE `/exam/admin/passages/delete/:id`
    
- **Questions (`exam_questions`)**
  - Schema: Links to `subjectId`, `passageId` (optional), `educationGradeId` (optional). Contains deep JSONB `content` (replaces hardcoded HTML constraints).
  - Deletion Constraint: Built with cascading deletes for its children (Options/Solutions are deleted synchronously when the parent question is deleted).
  - Endpoints:
    - [x] POST `/exam/admin/questions/create`
    - [x] POST `/exam/admin/questions/list` (Detailed filters including difficulty, tier, subject, and grade)
    - [x] PUT `/exam/admin/questions/update/:id`
    - [x] DELETE `/exam/admin/questions/delete/:id`

- **Question Options (`exam_question_options`)**
  - Schema: Added `isActive`, `createdAt`, `updatedAt` for consistency.
  - Endpoints:
    - [x] POST `/exam/admin/question-options/create`
    - [x] POST `/exam/admin/question-options/list`
    - [x] PUT `/exam/admin/question-options/update/:id`
    - [x] DELETE `/exam/admin/question-options/delete/:id`
    - [x] POST `/exam/admin/question-options/deletes` (Added bulk delete capability)

- **Question Solutions (`exam_question_solutions`)**
  - Schema: Added `isActive`. Links to specific `solutionType` (Trick, General, Tips).
  - Endpoints:
    - [x] POST `/exam/admin/question-solutions/create`
    - [x] POST `/exam/admin/question-solutions/list`
    - [x] PUT `/exam/admin/question-solutions/update/:id`
    - [x] DELETE `/exam/admin/question-solutions/delete/:id`
    - [x] POST `/exam/admin/question-solutions/deletes` (Added bulk delete capability)

## Phase 5: Packages & Test Taking (Client)

This phase represents the next major milestone. It will bridge the gap between administrative content creation and end-user testing experiences.

### Planned Next Steps

1. **Test Packages Setup (`exam_packages`, `exam_package_sections`)**
   - Create schemas to bundle individual questions into purchasable/accessible "Tryouts" or "Exercises".
   - Define sub-sections (e.g., separating "Penalaran Umum" from "Pengetahuan Kuantitatif").

2. **Session Generation (`exam_user_sessions`)**
   - Implement the flow for a user intentionally starting a test, including locking them into a specific variant.

3. **Answer Tracking (`user_answers`)**
   - Build high-speed endpoints for users to select/deselect multiple-choice options in real-time.

4. **Grading & Reporting**
   - Calculate final scores factoring in IRT (Item Response Theory) if defined by difficulty or traditional weighted points.
   - Aggregate statistics to update user profiles and global rankings.

### Known Architectural Decisions
*   **Paging/Listing API Strategy:** We opted to use `POST` instead of `GET` for the list endpoints. This pattern allows us to cleanly accept complex JSON validation through TypeBox body objects (such as robust nested filter conditions) which are difficult to parse in standard query strings.
*   **Locales First:** Any string returned directly to the user/admin UI is strictly mapped against `src/locales/id/exam.json` through the Fastify `i18n` handler.
*   **Cascade Controls:** Deep deletion checks are relegated to PostgreSQL's native `CASCADE` or `RESTRICT` depending on data safety. Specifically, deleting an `exam_question` safely cascades and rips out options/solutions to avoid orphan queries. Evaluated `RESTRICT` on packages so users don't mysteriously lose test records.
