# Course Engine Specification

This document outlines the architecture and technical strategy for the **Course Module** within the Sicerdas backend.

## Architecture Highlights

The Course Module is built around structured, sequential learning paths. The database schema focuses on tracking user progress through a defined taxonomy.

1. **Course Structure**: The taxonomy revolves around the hierarchy: `Courses -> Chapters -> Lectures`.
2. **Lecture Flexibility**: A lecture is the primary atomic unit of consumption. It can take many forms controlled by the `EnumLectureType`: `VIDEO`, `TEXT`, `PDF`, `DISCUSSION`, `QUIZ`, or `EXAM`.
3. **Flexible Storage Mechanism**: The `course_lectures` table purposefully relies on a `referenceUrl` (varchar) column and an `extra` (JSONB) column. This allows it to link external media, embedded iframes, or cross-reference other database modules without requiring rigid schema alterations for future media types.

---

## Integrating with the Exam (CBT) Engine

To prevent duplicating complex logic (like IRT scoring, timers, and variation grading), the Course engine dynamically relies on the separate Exam Module to deliver robust test-taking experiences within a course.

### The Two-Tiered Bridge Strategy

Rather than importing questions directly into the Course database, we utilize a strict linking strategy. Both forms of assessment reference the `exam_packages` table:

#### 1. The `EXAM` Lecture Type (Heavyweight Check)

- **Usage**: Midterms, final exams, or major mock-tests integrated within a syllabus.
- **Mechanism**: The instructor creates a massive, multi-section Exam Package in the isolated CBT dashboard. Inside the Course Builder, they set the lecture type to `EXAM` and paste the generated Exam `packageId` directly into the `course_lectures.referenceUrl` string field.
- **Experience**: The student clicks "Start" and is seamlessly ported into the strict, timer-enforced CBT simulation.

#### 2. The `QUIZ` Lecture Type (Lightweight Pop-quiz)

- **Usage**: Quick 3-5 question knowledge checks at the end of a video lecture to verify retention.
- **Mechanism (Invisible Integration)**: To save the instructor from navigating the complex CBT dashboard, the React frontend allows them to author simple questions directly inside the Course builder UI. When saved, the backend invisibly generates a "Micro Exam Package" (containing exactly 1 section) and links it behind the scenes to the lecture via `referenceUrl` or the `extra` JSONB field (e.g., `{ "packageId": "xxx" }`).
- **Benefit**: Retains strict database segregation (Exams stay Exams) while delivering a seamless, unified, and easy-to-use UX for the course creators.

---

## Core Tables Overview

- **`courses`**: The primary parent entity defining the course metadata, pricing, visibility, and instructor relation.
- **`course_chapters`**: The structural sections/modules splitting a course into manageable topics.
- **`course_lectures`**: The atomic content items. Format is determined by the `lecture_type` enum (Video, PDF, Exam etc.).
- **`course_enrollments`**: Tracks whether a user has access to content, mirroring tier-access but specifically on an isolated course-by-course basis.
- **`course_user_progress`**: Granular tracking indicating which precise `lecture_id` a user has completed, driving the visual completion percentage bars in the UI.
- **`course_stats_*`**: Incremental aggregation tables to rapidly query analytics (like aggregate course enrollments) without executing expensive database JOIN operations.
