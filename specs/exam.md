# Exam & Practice Questions Module (CBT) Specification

This document details the database architecture and technical strategy for the **Practice Questions and Computer-Based Test (CBT) engine** within the Sicerdas backend.

The database is built using PostgreSQL and Drizzle ORM. The schema logic is thoroughly normalized into **18 distinct tables** supporting the Exam module, primarily located in `src/db/schema/exam/`.

## Architecture Highlights

1.  **BlockNote Integration (Rich Text):** All complex text content (questions, passages, options, solutions) strictly utilize the `JSONB` data type to store the BlockNote rich-text editor data structure. This permits native embedding of mathematical formulas, nested lists, and inline images without rigid table alterations or unmaintainable HTML blobs.
2.  **Monetization & Tier Gating:** The assessment system natively intertwines with the existing Sicerdas Tier Pricing infrastructure (`tier_pricing.slug`). Access control is enforced at three distinct levels: Packages, Questions, and Individual Solutions.
3.  **Targeted Educational Delivery:** Questions and Exam Packages hold links to the `education_grades` table, meaning tests can dynamically target specific school levels (e.g., separating Grade 6 Math from High School Calculus).
4.  **Incremental Aggregation (Performance Optimization):** High-load dashboard statistics rely on "Incremental Aggregation" `user_stats` tables which are updated via simple increments (`total + x`) rather than expensive time-consuming `SUM/JOIN` queries on the entire user's history log.
5.  **Multi-Method Solutions:** Solving a single question can be documented using multiple methodologies (e.g., General method, Fast Trick/King Method), with the advanced fast tricks being easily locked behind the Premium tier wall.
6.  **Template Questions & Parameterization (Anti-Cheat & Replayability):** Questions support dynamic templates (e.g., `{{a}} + {{b}} = ?`) powered by a predefined `variableFormulas` JSON config.

- **Hybrid Structure:** Uses a `{ variables: [], solutions: {} }` syntax. The `variables` array holds flat objects containing both base inputs and fully calculated distractors (e.g., `{ a: 5, b: 10, opt1: 15, opt2: 5 }`). This completely eliminates heavy mathematical calculation from the CBT Engine "Critical Path", ensuring live exams are blazing fast and 100% crash-proof due to syntax bugs.
- **Dynamic Solutions:** Post-exam review is not time-critical, so calculation steps within `solutions` optionally use math formulas (e.g., `step1: "a * b"`) to auto-evaluate intermediate explanations across all variations at runtime.
- **Options Trick:** One base option text is always statically `{{opt1}}` (flagged `isCorrect = true` in DB). The CBT engine injects the explicit literal value from the selected `variables` row and seamlessly randomizes the final UI order (A, B, C, D) so the db correctly matches the index.
- **Tracking:** `exam_session_answers` stores `variationIndex` to guarantee that a user reviewing their history will see the exact same variation they took.
- **Scalability (Expression Indexing):** To efficiently count variations across hundreds of thousands of questions without full table scans, `exam_questions` enforces a PostgreSQL Functional Index on `jsonb_array_length(variableFormulas->'variables')`. This enables massive statistical dashboards and ultra-fast admin filtering without data-drift risks from normalized integer columns.

7.  **High-Performance Filtering (Pre-Aggregated Stats):** Public listing APIs (like `/filter-params`) do not perform live counts on the package table. Instead, they query the `education_category_grade_stats` table (detailed in `education.md`) which maintains cached counts for category/grade intersections.

### Admin Authoring UI: Variable Formulas

To ensure a high-end authoring workflow, the `variableFormulas` editor acts as a **Flat-Data Hub** combined with a **Dual-View Array Editor**:

1.  **Spreadsheet / Table View (Default):**
    - **Data Grid Interface:** A dynamic Excel-like grid mapping exactly to the `variables` array, automatically rendering columns for any keys detected (`a`, `b`, `opt1`, `opt2`).
    - **Solutions Logic View:** An additional pane strictly reserved for solution step formulas.
2.  **Raw JSON View:**
    - **Power-User Mode:** Direct JSON manipulation of the entire array.
    - **Bulk Generation:** Because the target structure is flat key-value pairs, admins can generate 1,000s of variations using Python, Excel, or LLMs, and simply copy-paste the raw JSON output into the portal.
3.  **Synchronization & Live Preview:**
    - Real-time previews recalculate both the BlockNote Question UI and the backend Solution formulas using the row currently selected by the Admin string-injector.

---

## The 18 Tables Breakdown

All tables are prefixed with `exam_` within PostgreSQL but are stripped off the prefix for inner file naming conventions to keep the codebase concise.

### 📚 1. Core Question Bank

- 1. **`education_categories`**: Macro-level grouping (e.g., 'CPNS 2026', 'UTBK Kedokteran'). Located in `education/`.
- 2. **`exam_subjects`**: Specific exam modules (e.g., 'Matematika', 'Tes Intelegensia Umum').
- 3. **`exam_passages`**: Contextual containers for long reading texts or data tables designed to be referenced by sequential questions without duplication.
- 4. **`exam_questions`**: The central vault for all question prompts. Supports `content` (main prompt/statement) and `reason_content` (for specialized reasoning types). Protected by `required_tier`.
- 5. **`exam_question_options`**: The multiple-choice selections linked to specific questions, storing the definitive boolean marker for correct answers.
- 6. **`exam_question_solutions`**: Stores the explanation of the question. Categorized by `solution_type` ('general', 'fast_method', 'tips'). Fast methods can enforce the `required_tier` restriction.

### 🏷️ 2. Tagging & Ad-hoc Generation

- 7. **`education_tags`**: Catalog database for micro-topics (e.g., 'Syllogism', 'Geometry', 'HOTS'). Located in `education/`.
- 8. **`exam_question_tags`**: many-to-Many junction linking `exam_questions` and `education_tags`. It serves as the query engine for generating random Custom Practices for users (e.g., "Give me 10 random HOTS Geometry questions").

### 📦 3. Assembly & Exam Definition

- 9. **`exam_packages`**: The actual bundle that users "start". Represents either a pre-determined Official Tryout or a `custom_practice` generated on the fly by users. Includes a strict `required_tier`, `education_grade_id`, and a **`thumbnail`** field for card-based UI presentation.
  - **High-End Authoring**: The admin editor for packages utilizes a **Standalone Page Router** with a **Dual-View Preview**.
  - **Hero View**: Displays the full original image to ensure content/text visibility.
  - **Student Card Preview**: A 16:9 simulated preview simulating exactly how the student will see the package on their dashboard.
- 10. **`exam_package_sections`**: Divides an exam package into logical sub-tests (e.g., Literasi Bahasa, Penalaran Matematika). Includes an optional `groupName` (e.g., "SKD" or "Basic Arithmetic") used to visually group related sections together in the UI without requiring an overly complex nested database structural tree.
- 11. **`exam_package_questions`**: Junction table that glues questions to an `exam_package`. It mandates a link to a `sectionId` (to enforce standardized package structures and prevent mixed-state bugs) and enforces the default sequence ordering of the questions.

### ⏱️ 4. Active CBT Sessions

- 11. **`exam_sessions`**: The historical ledger marking a single User Attempt upon a specific Package. Tracks start times, statuses (`in_progress`, `completed`), and the ultimate numeric Score calculation.
- 12. **`exam_session_answers`**: The dynamically localized "Answer Sheet". It tracks the user's specific randomized shuffling sequence for questions, immediately auto-saves `selectedOptionId`, evaluates correctness upon end, and flags "is_doubtful" (Ragu-ragu) user status markers.

### 📈 5. Gamification & Adaptive Analytics

- 13. **`exam_user_stats_global`**: High-level dashboard aggregate. Running totals of exams taken, cumulative score averages over the user's entire lifespan.
- 14. **`exam_user_stats_subject`**: Subject-specific radar (e.g., "User is strong in TWK but weak in TIU"). Records accuracy rates specifically tied to an `exam_subject`.
- 15. **`exam_user_stats_tag`**: hyper-granular accuracy tracking. Exposes targeted frailties (e.g., "The user frequently fails Algebra tags"). The AI Engine or system relies on this data to present "Improve your Algebra" practice recommendations.

### 📈 6. Engagement & User Interaction

- 17. **`exam_package_interactions`**: Per-user interaction ledger. Tracks individual state for each package, including `liked`, `bookmarked`, `rating`, and `viewCount`.
- 18. **`exam_package_event_stats`**: Global aggregated statistics for packages. Maintains performance-optimized counters for `viewCount`, `likeCount`, `bookmarkCount`, and `rating` (average) to avoid expensive on-the-fly calculations.

---

## Recommended Data Workflow (Reconciliation)

To fight against **Data Drift**, specifically concerning the `exam_user_stats_*` tables which rely wholly on fast Incremental Aggregation logic:

1. When an `exam_session` switches from `in_progress` to `completed`, backend processes perform incremental `UPDATE table SET column = column + X` on the stats tables.
2. A separate **Reconciliation Script** (Lambda/Cron Job) is advised to run during off-peak hours (e.g., 3:00 AM) to recalculate the statistics from the absolute truth located in `exam_session_answers` and enforce corrections if server crashes previously resulted in desynchronization.
