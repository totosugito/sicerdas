# Exam Session & Mode Selection (CBT Engine)

This document outlines the technical specification for the "Section-Based Mode Selection" and the core CBT Engine flow.

## 1. Core Architecture & Rules

- Users interact with exams at the **Section Level** (e.g., clicking "Sub-test Literasi" starts an isolated session for that section only).
- **Two Distinct Modes**:
  1. **Mode Belajar (Study Mode):** No time limits. Immediate feedback. Solutions are revealed instantly after selecting an answer. First click is final (one-shot answer) to maintain accurate analytics.
  2. **Tryout (Exam Mode):** Strict time limits enforced. Delayed feedback. Users can change answers before final submission.
- **Analytics Integrity:** Both modes update the user's global and tag/subject statistics.
- **Resume Capability:** Sessions track exact `elapsedSeconds`, allowing users to close the tab and resume tomorrow exactly where they left off.
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
});
```

---

## 3. Backend API Routes (`/api/exam/sessions/user`)

The CBT engine relies on a strict 6-API architecture to ensure zero data leakage and secure evaluation:

**A. Session Management & Actions**

1. **`POST /start`**: Starts a new session or resumes an `IN_PROGRESS` one.
   - Requires `packageId`, `sectionId`, `mode`.
   - **Crucial:** Scrambles questions and options here. Inserts into `exam_session_answers`.
2. **`POST /save-answer`**: Syncs user interactions (Autosave).
   - Accepts `selectedOptionId`, `textAnswer`, `isDoubtful` (Ragu-Ragu flag), and current `elapsedSeconds`.
   - **Note:** This API _only_ saves the answer. It does NOT evaluate correctness or return solutions.
3. **`POST /submit`**: Finishes the exam.
   - Changes status to `COMPLETED`. Updates all `user_stats_*` tables via incremental aggregation.
4. **`POST /abandon`**: Restarts/Forfeits an exam early.
   - Changes status to `ABANDONED`. Still grades answered questions for partial analytics.

**B. Pre-Exam & History** 5. **`POST /history`**: Fetches a user's past attempts for a specific package and section.

- **Note:** Recently updated to a `POST` request to support pagination (`page`, `limit` in body).
- Returns a paginated list of `COMPLETED`, `IN_PROGRESS`, and `ABANDONED` sessions to show in the Section Mode Dialog before starting.

**C. Data Fetching (Lazy Loading Architecture)** 6. **`GET /:id/details`**: Fetches lightweight session metadata.

- Returns the active timer, score, and the **Navigation Grid** (array of question IDs, their scrambled order, and their status: answered/unanswered/doubtful).
- _Never_ returns HTML content or solutions.

7. **`GET /:id/questions/:questionId`**: Fetches heavy content for a specific question.
   - Returns the question's rich text content, passage, and randomized options.
   - **Performance Rule (JSON to HTML)**: The backend MUST convert the stored BlockNote JSON arrays for the passage, question, and options into raw HTML strings before sending the response. This prevents the frontend from needing to load heavy BlockNote editors to render the exam.
   - **Secure Evaluation Rule (Study Mode):** If the session is `completed`, or if it is `mode === 'study'` AND the user has already answered this question, the backend will:
     1. Evaluate the answer (`isCorrect: true/false`).
     2. Attach the `exam_question_solutions` array (also converted to HTML).
   - If in `tryout` mode (and not completed), or if unanswered, solutions and correctness are strictly omitted.

---

## 4. Scheduled Jobs (Cron)

- **`purge-old-exam-answers.ts`**: Deletes `exam_session_answers` rows for sessions > `EXAM_ANSWERS_RETENTION_DAYS` (e.g., 365) to save DB space. Sets `is_answers_purged = true` on the parent session.
- **`clean-stale-sessions.ts`**: Finds `IN_PROGRESS` sessions inactive for > `EXAM_STALE_SESSION_DAYS` (e.g., 30) and marks them as `ABANDONED`.

---

## 5. Frontend Requirements

### A. Section Mode Dialog (`PackageSectionAccordion.tsx`)

When clicking a section, a dialog opens:

1. **History List**: Shows past attempts for this section (e.g., "Attempt 1: 85% - Tryout").
2. **Action Buttons**:
   - If an active session exists: "Resume Tryout (15 mins left)".
   - Or start fresh: "Start Mode Belajar" vs "Start Tryout".

### B. The Exam Engine Page (`/exam/session/$sessionId.tsx`)

This is the main interactive interface. It uses a **Hybrid Layout** optimized for desktop and mobile, dividing the screen into four key zones:

1. **Top Header**: Contains the Exam Title (Left), Timer (Center), and Submit button (Right).
2. **Right Sidebar**: Contains the Navigation Grid (question numbers 1 to N, color-coded) and the "Ragu-Ragu" checkbox. (Becomes a drawer/sheet on mobile).
3. **Main Content (Center)**: Displays "Question X of Y", the reading passage (if any), the rich-text question, and the inline options (A, B, C, D, E).
4. **Sticky Bottom Bar**: Always visible at the bottom of the screen. Contains `[< Previous]` on the left, `[Next >]` on the right, and a fast-action **Answer Pad** (`[A] [B] [C] [D] [E]`) in the center to solve the UX issue of scrolling past large option images.

It dynamically adjusts behavior based on `session.mode`:

| UI Component              | `mode === 'study'`                                                  | `mode === 'tryout'`                                                                                                          |
| :------------------------ | :------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| **Timer UI**              | Hidden, or a simple count-up stopwatch.                             | Countdown timer (red when `< 5 mins`).                                                                                       |
| **Option Click**          | Locks answer immediately. Displays "Correct/Wrong" UI.              | Selects option (via inline click or bottom Answer Pad). Can be changed until submit.                                         |
| **Pembahasan (Solution)** | Appears instantly below the question after clicking an option.      | Hidden entirely.                                                                                                             |
| **Navigation Grid**       | Shows specific color for answered (green/red based on correctness). | Shows gray (unanswered), blue (answered), yellow (ragu-ragu).                                                                |
| **"Ragu-Ragu" Checkbox**  | Hidden.                                                             | Available for marking uncertain answers.                                                                                     |
| **Submission**            | Manual "Finish Study" button.                                       | Manual "Submit Exam" button. **If timer hits 0**, a modal appears: _"Waktu Habis! Sedang mengumpulkan..."_ and auto-submits. |

### C. The Results Page (`/exam/result/$sessionId.tsx`)

- Displays the final calculated score, time taken, and accuracy breakdown.
- Contains a "Review Mode" allowing the user to click through the exam again and read all `exam_question_solutions`.
- (If `isAnswersPurged === true`, shows a warning banner that detailed review is unavailable).
