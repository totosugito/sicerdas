# Exam Session & CBT Engine — Complete Specification

This document is the single source of truth for the **Section-Based Exam Session** feature, covering the core CBT Engine flow, database schema, backend APIs, frontend architecture, scheduled jobs, and custom practice generation.

---

## 1. Core Architecture & Rules

- Users interact with exams at the **Section Level** (e.g., clicking "Sub-test Literasi" starts an isolated session for that section only).
- **Two Distinct Modes**:
  1. **Mode Belajar (Study Mode):** No time limits. Immediate feedback. Solutions are revealed instantly after selecting an answer. First click is final (one-shot answer) to maintain accurate analytics.
  2. **Tryout (Exam Mode):** Strict time limits enforced. Delayed feedback. Users can change answers before final submission.
- **Analytics Integrity:** Both modes update the user's global and tag/subject statistics.
- **Resume Capability:** Sessions track exact `elapsedSeconds`, allowing users to close the tab and resume exactly where they left off.
- **Randomization:** The order of questions and the visual order of options (A, B, C, D) are scrambled by the **Backend** during session creation, ensuring consistent layouts during a resume.

---

## 2. Database Schema Modifications

### `exam_sessions`

```typescript
export const examSessions = pgTable("exam_sessions", {
  // ... existing fields ...

  mode: PgEnumExamSessionMode("mode").default("tryout").notNull(),
  sectionId: uuid("section_id")
    .references(() => examPackageSections.id)
    .notNull(),

  // Pause/Resume tracking
  elapsedSeconds: integer("elapsed_seconds").default(0).notNull(),

  // Timer enforcement (true for Tryout, false for Belajar)
  isTimerActive: boolean("is_timer_active").default(true).notNull(),

  // Data retention flag
  isAnswersPurged: boolean("is_answers_purged").default(false).notNull(),

  // Session statistics preserved even after answers are purged
  totalCorrect: integer("total_correct").default(0).notNull(),
  totalWrong: integer("total_wrong").default(0).notNull(),
  totalSkipped: integer("total_skipped").default(0).notNull(),

  // Weighted scoring fields
  earnedPoints: decimal("earned_points", { precision: 10, scale: 2 }).default("0").notNull(),
  maxPoints: decimal("max_points", { precision: 10, scale: 2 }).default("0").notNull(),
  score: decimal("score", { precision: 10, scale: 2 }),
});
```

---

## 3. Backend API Routes (`/api/exam/sessions/user`)

The CBT engine relies on a strict 7-API architecture to ensure zero data leakage and secure evaluation:

### A. Session Management & Actions

1. **`POST /start`**: Starts a new session or resumes an `IN_PROGRESS` one.
   - Requires `packageId`, `sectionId`, `mode`.
   - **Crucial:** Scrambles questions and options here. Inserts into `exam_session_answers`.
   - **Question Pool:** If the section's `questionLimit` is set, only that many questions are randomly selected from the section's full pool (e.g., 10 out of 100). Otherwise, all questions are included.

2. **`POST /save-answer`**: Syncs user interactions (Autosave).
   - Accepts `selectedOptionId`, `textAnswer`, `isDoubtful` (Ragu-Ragu flag), and current `elapsedSeconds`.
   - **Note:** This API _only_ saves the answer. It does NOT evaluate correctness or return solutions.

3. **`POST /submit`**: Finishes the exam.
   - Changes status to `COMPLETED`. Updates all `user_stats_*` tables via incremental aggregation.

4. **`POST /abandon`**: Restarts/Forfeits an exam early.
   - Changes status to `ABANDONED`. Still grades answered questions for partial analytics.

### B. Pre-Exam & History

5. **`POST /history`**: Fetches a user's past attempts for a specific package and section.
   - Uses `POST` to support pagination (`page`, `limit` in body).
   - Returns a paginated list of `COMPLETED`, `IN_PROGRESS`, and `ABANDONED` sessions to show in the Section Mode Dialog before starting.

### C. Data Fetching (Lazy Loading Architecture)

To keep the initial load fast and minimize data usage, heavy content is fetched on-demand:

6. **`GET /:id/details`**: Fetches lightweight session metadata.
   - Returns the active timer, score, and the **Navigation Grid** (array of question IDs, their scrambled order, and their status: answered/unanswered/doubtful).
   - _Never_ returns HTML content or solutions.

7. **`GET /:id/questions/:questionId`**: Fetches heavy content for a specific question.
   - Returns the question's rich text content, passage, and randomized options.
   - **Performance Rule (JSON to HTML)**: The backend MUST convert the stored BlockNote JSON arrays for the passage, question, and options into raw HTML strings before sending the response. This prevents the frontend from needing to load heavy BlockNote editors to render the exam.
   - **Secure Evaluation Rule (Study Mode):** If the session is `completed`, or if it is `mode === 'study'` AND the user has already answered this question, the backend will:
     1. Evaluate the answer (`isCorrect: true/false`).
     2. Attach the `exam_question_solutions` array (also converted to HTML).
   - If in `tryout` mode (and not completed), or if unanswered, solutions and correctness are strictly omitted.

> [!IMPORTANT]
> **Solutions API Security**: The frontend does NOT pass a parameter to request solutions. The backend evaluates every question and decides server-side whether to attach solutions based on session status and mode. This is a strict, secure, single-API architecture.

---

## 4. Scheduled Jobs (Cron)

- **`purge-old-exam-answers.ts`**: Deletes `exam_session_answers` rows for sessions > `EXAM_ANSWERS_RETENTION_DAYS` (e.g., 365) to save DB space. Sets `is_answers_purged = true` on the parent session.
- **`clean-stale-sessions.ts`**: Finds `IN_PROGRESS` sessions inactive for > `EXAM_STALE_SESSION_DAYS` (e.g., 30) and marks them as `ABANDONED`.

---

## 5. Frontend Architecture (`/exam/session/$sessionId.tsx`)

### Design Goals

Build a robust, responsive, and interactive exam engine interface that seamlessly handles both "Study" (Mode Belajar) and "Tryout" modes. The UI must be highly aesthetic, adhering to premium design standards (vibrant accents, glassmorphism, modern typography), and ensure a smooth user experience on both desktop and mobile.

### A. Section Mode Dialog (`PackageSectionAccordion.tsx`)

When clicking a section, a dialog opens:

1. **History List**: Shows past attempts for this section (e.g., "Attempt 1: 85% - Tryout").
2. **Action Buttons**:
   - If an active session exists: "Resume Tryout (15 mins left)".
   - Or start fresh: "Start Mode Belajar" vs "Start Tryout".

### B. The Exam Engine Page — Layout Zones

The page uses a **Hybrid Layout** optimized for desktop and mobile, dividing the screen into four key zones:

#### Zone 1: Header (Sticky Top Bar)

- **Left**: Exam Title (e.g., "Tryout UTBK - Sub-test Literasi").
- **Center**: Timer Component.
  - _Tryout_: Strict countdown. Turns red and pulses when `< 5 mins` remain.
  - _Study_: A simple count-up stopwatch (or hidden, depending on design preference).
- **Right Controls**:
  - **Text Size Adjuster**: Small `A- / A+` buttons to increase/decrease question font size for accessibility.
  - **Action Button**: "Submit Exam" (Tryout) or "Finish Study" (Study).

#### Zone 2: Main Question Area (Left/Center Column)

- **Loading State**: When moving to a new question, a skeleton loader flashes briefly while the `question.ts` API fetches the content.
- **Question Navigator**: "Question X of Y" header.
- **Passage Area (Optional)**: If the question has a linked `passageId` (like a reading comprehension text), it is displayed here in a scrollable panel.
- **Question Content**: The rich text (BlockNote/HTML) of the question itself.
- **Options Presentation (Hybrid Approach)**:
  1. **Inline View**: The options (A, B, C, D, E) are displayed below the question with their full text/images. Users _can_ click them directly.
  2. **Sticky Answer Pad**: Because options can sometimes be very long or contain large images (causing accidental clicks or excessive scrolling), a sticky "Answer Pad" at the bottom of the screen has large, easy-to-click buttons: `[ A ] [ B ] [ C ] [ D ] [ E ]`.
  - _Study Mode Feedback_: Clicking an option locks the UI. A green/red border appears indicating correct/wrong, and the solution is fetched.
- **Solution Area (Pembahasan)**: _Only visible in Study Mode after answering_. Appears seamlessly below the options.
- **Bottom Navigation**: Large "Previous" and "Next" buttons.

#### Zone 3: Navigation Sidebar (Right Column / Drawer on Mobile)

- **Mobile View**: Hidden inside a floating "Grid" button or a bottom sheet to save screen space.
- **Desktop View**: Fixed on the right side.
- **The Grid**: A matrix of buttons representing all questions.
  - _Tryout Colors_: Gray (Unanswered), Blue (Answered), Yellow (Ragu-ragu).
  - _Study Colors_: Gray (Unanswered), Green (Correct), Red (Wrong).
- **"Ragu-Ragu" Checkbox**: _Only in Tryout Mode_. Allows the user to flag the current question for review later.
- **Color Legend**: A small key explaining what the grid colors mean.

#### Zone 4: Sticky Bottom Bar

Always visible at the bottom of the screen. Contains `[< Previous]` on the left, `[Next >]` on the right, and a fast-action **Answer Pad** (`[A] [B] [C] [D] [E]`) in the center to solve the UX issue of scrolling past large option images.

### C. Mode Behavior Matrix

| UI Component              | `mode === 'study'`                                                  | `mode === 'tryout'`                                                                                                          |
| :------------------------ | :------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| **Timer UI**              | Hidden, or a simple count-up stopwatch.                             | Countdown timer (red when `< 5 mins`).                                                                                       |
| **Option Click**          | Locks answer immediately. Displays "Correct/Wrong" UI.              | Selects option (via inline click or bottom Answer Pad). Can be changed until submit.                                         |
| **Pembahasan (Solution)** | Appears instantly below the question after clicking an option.      | Hidden entirely.                                                                                                             |
| **Navigation Grid**       | Shows specific color for answered (green/red based on correctness). | Shows gray (unanswered), blue (answered), yellow (ragu-ragu).                                                                |
| **"Ragu-Ragu" Checkbox**  | Hidden.                                                             | Available for marking uncertain answers.                                                                                     |
| **Submission**            | Manual "Finish Study" button.                                       | Manual "Submit Exam" button. **If timer hits 0**, a modal appears: _"Waktu Habis! Sedang mengumpulkan..."_ and auto-submits. |

### D. Critical Modals & UX Features

- **Network Drop Modal**: If a `save-answer` API call fails due to no connection, we instantly block the UI with an error modal ("Connection Lost. Failed to save answer."). The user **cannot** proceed to the next question until the connection is restored and the answer successfully saves. This guarantees 100% data integrity without complex offline-sync logic.
- **Submit Confirmation Dialog**: If the user clicks "Submit Exam", a modal appears: _"Are you sure? You still have 3 unanswered questions."_
- **Keyboard Shortcuts**: Arrow keys (Left/Right) to navigate questions, letters (A, B, C, D) to select options.

### E. The Results Page (`/exam/result/$sessionId.tsx`)

- Displays the final calculated score, time taken, and accuracy breakdown.
- Contains a "Review Mode" allowing the user to click through the exam again and read all `exam_question_solutions`.
- (If `isAnswersPurged === true`, shows a warning banner that detailed review is unavailable).

---

## 6. Custom Practice Generation Flow

To support adaptive learning, users can generate "Custom Practices" targeting their specific weaknesses (tags).

**Process:**
1. **Selection:** The frontend identifies weak tags (e.g., via `accuracyRate` in `exam_user_stats_tag`).
2. **Generation API (`POST /api/exam/packages/user/generate-custom`)**:
   - Frontend sends `categoryId`, `educationGradeId`, `tagIds[]`, `limit`, and optional `packageTitle`/`sectionTitle`.
   - Backend selects random questions matching the grade and tags.
   - Backend creates a private `exam_package` with `examType: 'custom_practice'`.
   - Returns `packageId` and `sectionId`.
3. **Start Exam:** The frontend immediately calls `POST /api/exam/sessions/user/start` with the returned IDs to begin the session.
4. **Review:** Custom practices appear in the user's History, just like official tryouts, but are excluded from the global public package listing.

---

## 7. Design Decisions & Resolved Questions

These architectural decisions have been finalized:

1. **State Management**: Since this is a self-contained page, local React state (`useState`/`useReducer`) or a specialized context is sufficient. A small `zustand` slice may be used if timer logic separation is needed.
2. **Mobile Layout**: The right-hand Navigation Grid is hidden inside a slide-out drawer (Sheet) or a collapsible bottom sheet on mobile.
3. **Error Handling (Strict & Simple)**: No offline queue — the UI blocks on network failure until the connection is restored. This guarantees data integrity without complex offline-sync logic.

---

## 8. Verification Plan

- **Design Review**: Ensure the layout is premium (vibrant accents, glassmorphism if applicable, modern typography).
- **Responsive Test**: Verify the Sidebar translates cleanly to a mobile-friendly Drawer/Sheet.
- **Mode Switch Test**: Verify that Study mode strictly locks answers and Tryout mode allows changes and "Ragu-Ragu" marking.
