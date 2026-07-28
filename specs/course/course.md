# Course Engine Specification

This document outlines the architecture and technical strategy for the **Course Module** within the Sicerdas backend.

## Architecture Highlights

The Course Module is built around structured, sequential learning paths. The database schema focuses on tracking user progress through a defined taxonomy.

1. **Course Structure**: The taxonomy revolves around the hierarchy: `Courses -> Chapters -> Lectures`.
2. **Lecture Flexibility**: A lecture is the primary atomic unit of consumption. It can take many forms controlled by the `EnumLectureType`: `VIDEO`, `TEXT`, `PDF`, `DISCUSSION`, `EXAM`, or `OTHER`.
3. **Flexible Storage Mechanism**: The `course_lectures` table purposefully relies on a `referenceUrl` (varchar) column and an `extra` (JSONB) column. This allows it to link external media, embedded iframes, or cross-reference other database modules without requiring rigid schema alterations for future media types. For EXAM types, `referenceUrl` stores the `sectionId` of the hidden `course_exam` package section, while `extra` stores `successThreshold`.

---

## Integrating with the Exam (CBT) Engine

To prevent duplicating complex logic (like IRT scoring, timers, and variation grading), the Course engine dynamically relies on the separate Exam Module to deliver robust test-taking experiences within a course.

### The Hidden Course Package Strategy

Rather than linking to public exam packages (which creates synchronization problems between modules), the Course engine creates **private, hidden exam packages** that are exclusively accessible from within the course. This ensures a clean one-way dependency with zero sync issues.

#### Key Principle: Isolated Ownership

- Each EXAM lecture in a course owns a **dedicated hidden exam package**.
- These packages use a new `examType`: `course_exam`.
- They are **filtered out** from the public exam listing (`POST /exam/packages/list`).
- Users can **only access** them through the course UI — never from the standalone exam menu.
- This eliminates the sync problem entirely: since sessions can only be created from one entry point (the course), there is no scenario where one module knows about completion but the other doesn't.

#### The `EXAM` Lecture Type

- **Usage**: Any assessment within a course — from lightweight knowledge checks to full midterm/final exams.
- **Mechanism**: The instructor creates exam content within the Course Builder. The backend creates a hidden exam package (`examType: 'course_exam'`). Each section becomes a **separate EXAM lecture** in the course, with `referenceUrl` storing the `sectionId`. The course chapter naturally groups related exam sections together.
- **Cloning Public Packages**: If an instructor wants to reuse questions from an existing public tryout, the backend can **clone the package structure** (package → sections → question links) into a new hidden `course_exam` package. The underlying `exam_questions` are shared (not duplicated), only the container is cloned. Each cloned section becomes its own lecture.
- **Experience**: The student clicks "Start" and is seamlessly ported into the CBT simulation.

#### 3. Why Not Link to Public Packages Directly?

Linking a course lecture to a public exam package creates a bi-directional sync problem:

| Scenario | Problem |
|:---------|:--------|
| User completes exam from standalone Exam menu | Course doesn't know → progress stuck |
| User completes exam from Course | Exam package interactions updated, but course progress requires separate call |

With hidden packages, **all sessions are created from the course flow**, making progress tracking deterministic and unambiguous.

---

## Exam Module Changes Required

To support hidden course packages, the Exam module needs minimal changes:

1. **New `examType` value**: Add `course_exam` to `EnumExamType` in `exam/enums.ts`.
2. **Public listing filter**: The existing public listing (`POST /exam/packages/list`) already filters by `examType = 'official'`. No changes needed — course packages are automatically excluded.
3. **Session start validation**: Update `start-session.service.ts` to allow the `course_exam` package type in the `or()` clause (currently only allows `official` and user-owned `custom_practice`).

---

## Core Tables Overview

- **`courses`**: The primary parent entity defining the course metadata, pricing, visibility, and instructor relation.
- **`course_chapters`**: The structural sections/modules splitting a course into manageable topics.
- **`course_lectures`**: The atomic content items. Format is determined by the `lecture_type` enum (Video, PDF, Exam etc.).
- **`course_enrollments`**: Tracks whether a user has access to content, mirroring tier-access but specifically on an isolated course-by-course basis.
- **`course_user_progress`**: Granular tracking indicating which precise `lecture_id` a user has completed, driving the visual completion percentage bars in the UI.
- **`course_stats_*`**: Incremental aggregation tables to rapidly query analytics (like aggregate course enrollments) without executing expensive database JOIN operations.
