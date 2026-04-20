# Education Module Specification

This document details the core education metadata system in Sicerdas, which provides the underlying categorization, grading, and tagging infrastructure used across all content modules (Exams, Books, etc.).

## Core Entities

### 1. Education Categories

Macro-level grouping for content. Examples:

- **CPNS 2026**: Civil servant entrance exams.
- **Kedinasan**: Specialized government school entrance.
- **UTBK**: University entrance exams.

Located in `backend/src/db/schema/education/categories.ts`.

### 2. Education Grades

Specific school levels or sub-grouping within an education system. Examples:

- **SD (Kelas 1-6)**
- **SMP (Kelas 7-9)**
- **SMA (Kelas 10-12)**
- **Umum / Fresh Graduate**

Located in `backend/src/db/schema/education/grades.ts`.

### 3. Education Tags

Micro-topics used for granular tracking and content labeling. Examples:

- **Syllogism** (Verbal Reasoning)
- **Geometry** (Mathematics)
- **HOTS** (Higher Order Thinking Skills)

Located in `backend/src/db/schema/education/tags.ts`.

---

## Performance & Optimization: Category-Grade Statistics

To ensure a high-performance experience on content listing pages (such as the Exam Dashboard), Sicerdas utilizes a pre-aggregated statistics system.

### 📚 Education Category-Grade Statistics

Located in `backend/src/db/schema/education/category-grade-stats.ts`.

This table (`education_category_grade_stats`) tracks the distribution of content across different categories and grades. It eliminates the need for expensive `COUNT` and `GROUP BY` operations during high-traffic filtering requests.

#### Key Fields:

- **`categoryId`**: Reference to the Category.
- **`educationGradeId`**: Reference to the Grade.
- **`contentType`**: Enum indicating what type of content is being tracked (e.g., `exam`, `book`).
- **`totalCount`**: Total number of items in this intersection.
- **`activeCount`**: Number of active/published items available to users.

---

## Update Strategy (Hybrid Approach)

The statistics system follows a **Hybrid Update Strategy** to maintain 100% accuracy without sacrificing write performance.

### 1. Real-time Incremental Updates (Hooks)

When an administrator performs actions on content (Create, Update, Delete), specific "hook" functions are triggered to update the statistics table immediately.

- **Implementation**: Utility function `recalculateEducationStats` (in `src/utils/education-stats-utils.ts`) uses an **UPSERT** logic to count current records and update the stats row.
- **Performance**: Updates are scoped to specific `(category, grade, type)` combinations to minimize database contention.

### 2. Nightly Reconciliation (Source of Truth)

To prevent "data drift" (desynchronization between actual records and aggregated counts), a background reconciliation job runs periodically.

- **Implementation**: `backend/src/scripts/init/jobs/sync-education-stats.ts`.
- **Purpose**: Performs a full table scan to recalculate all statistics from the ground truth and correct any discrepancies.

---

## API Integration: Filter Parameters

The statistics table directly powers the `/filter-params` API endpoints (e.g., `/api/v1/exam/packages/filter-params`).

- **Logic**: The API only returns Categories and Grades where `activeCount > 0`.
- **Latency**: Sub-millisecond response times because it performs a simple `SELECT` from the pre-computed stats table rather than scanning the entire content database.
