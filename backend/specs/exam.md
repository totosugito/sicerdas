# Exam & Practice Questions Module (CBT) Specification

This document details the database architecture and technical strategy for the **Practice Questions and Computer-Based Test (CBT) engine** within the Sicerdas backend.

The database is built using PostgreSQL and Drizzle ORM. The schema logic is thoroughly normalized into 15 distinct tables located in `src/db/schema/exam/`.

## Architecture Highlights
1.  **BlockNote Integration (Rich Text):** All complex text content (questions, passages, options, solutions) strictly utilize the `JSONB` data type to store the BlockNote rich-text editor data structure. This permits native embedding of mathematical formulas, nested lists, and inline images without rigid table alterations or unmaintainable HTML blobs.
2.  **Monetization & Tier Gating:** The assessment system natively intertwines with the existing Sicerdas Tier Pricing infrastructure (`tier_pricing.slug`). Access control is enforced at three distinct levels: Packages, Questions, and Individual Solutions.
3.  **Targeted Educational Delivery:** Questions and Exam Packages hold links to the `education_grades` table, meaning tests can dynamically target specific school levels (e.g., separating Grade 6 Math from High School Calculus).
4.  **Incremental Aggregation (Performance Optimization):** High-load dashboard statistics rely on "Incremental Aggregation" `user_stats` tables which are updated via simple increments (`total + x`) rather than expensive time-consuming `SUM/JOIN` queries on the entire user's history log.
5.  **Multi-Method Solutions:** Solving a single question can be documented using multiple methodologies (e.g., General method, Fast Trick/King Method), with the advanced fast tricks being easily locked behind the Premium tier wall.

---

## The 15 Tables Breakdown

All tables are prefixed with `exam_` within PostgreSQL but are stripped off the prefix for inner file naming conventions to keep the codebase concise.

### 📚 1. Core Question Bank
*   **`exam_categories`**: Macro-level grouping (e.g., 'CPNS 2026', 'UTBK Kedokteran').
*   **`exam_subjects`**: Specific exam modules (e.g., 'Matematika', 'Tes Intelegensia Umum').
*   **`exam_passages`**: Contextual containers for long reading texts or data tables designed to be referenced by sequential questions without duplication.
*   **`exam_questions`**: The central vault for all question prompts. Protected by `required_tier` for partial teasing in free packages.
*   **`exam_question_options`**: The multiple-choice selections linked to specific questions, storing the definitive boolean marker for correct answers.
*   **`exam_question_solutions`**: Stores the explanation of the question. Categorized by `solution_type` ('general', 'fast_method', 'tips'). Fast methods can enforce the `required_tier` restriction.

### 🏷️ 2. Tagging & Ad-hoc Generation
*   **`exam_tags`**: Catalog database for micro-topics (e.g., 'Syllogism', 'Geometry', 'HOTS').
*   **`exam_question_tags`**: Many-to-Many junction linking `exam_questions` and `exam_tags`. It serves as the query engine for generating random Custom Practices for users (e.g., "Give me 10 random HOTS Geometry questions").

### 📦 3. Assembly & Exam Definition
*   **`exam_packages`**: The actual bundle that users "start". Represents either a pre-determined Official Tryout or a `custom_practice` generated on the fly by users. Includes a strict `required_tier` and `education_grade_id`.
*   **`exam_package_questions`**: Junction table that glues questions to an `exam_package`. It enforces the default sequence ordering of the questions.

### ⏱️ 4. Active CBT Sessions
*   **`exam_sessions`**: The historical ledger marking a single User Attempt upon a specific Package. Tracks start times, statuses (`in_progress`, `completed`), and the ultimate numeric Score calculation.
*   **`exam_session_answers`**: The dynamically localized "Answer Sheet". It tracks the user's specific randomized shuffling sequence for questions, immediately auto-saves `selectedOptionId`, evaluates correctness upon end, and flags "is_doubtful" (Ragu-ragu) user status markers.

### 📈 5. Gamification & Adaptive Analytics
*   **`exam_user_stats_global`**: High-level dashboard aggregate. Running totals of exams taken, cumulative score averages over the user's entire lifespan.
*   **`exam_user_stats_subject`**: Subject-specific radar (e.g., "User is strong in TWK but weak in TIU"). Records accuracy rates specifically tied to an `exam_subject`.
*   **`exam_user_stats_tag`**: hyper-granular accuracy tracking. Exposes targeted frailties (e.g., "The user frequently fails Algebra tags"). The AI Engine or system relies on this data to present "Improve your Algebra" practice recommendations.

---

## Recommended Data Workflow (Reconciliation)

To fight against **Data Drift**, specifically concerning the `exam_user_stats_*` tables which rely wholly on fast Incremental Aggregation logic:
1. When an `exam_session` switches from `in_progress` to `completed`, backend processes perform incremental `UPDATE table SET column = column + X` on the stats tables.
2. A separate **Reconciliation Script** (Lambda/Cron Job) is advised to run during off-peak hours (e.g., 3:00 AM) to recalculate the statistics from the absolute truth located in `exam_session_answers` and enforce corrections if server crashes previously resulted in desynchronization.
