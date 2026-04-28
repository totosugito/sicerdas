# Exam Session Page Architecture (`/exam/session/$id.tsx`)

This document outlines the proposed layout and component architecture for the Exam Engine page, based on the specifications in `specs/exam-session.md` and the available data from the `useSessionDetails` hook.

## Goal

Build a robust, responsive, and interactive exam engine interface that seamlessly handles both "Study" (Mode Belajar) and "Tryout" modes. The UI must be highly aesthetic, adhering to premium design standards, and ensure a smooth user experience even on mobile devices.

## Open Questions for Discussion

> [!WARNING]
> Please review these questions as they will impact the final implementation:

1.  **State Management**: Should we use local React state (like `useState`/`useReducer`) or a global store (like `zustand`) to manage the currently selected question, answers being drafted, and the countdown timer? Since this is a self-contained page, local state or a specialized context might be sufficient, but a small `zustand` slice could be cleaner for separating the timer logic.
2.  **Mobile Layout**: On mobile, the right-hand "Navigation Grid" will take up a lot of space. Should we hide it inside a slide-out drawer (Sheet) or a collapsible accordion at the top/bottom of the screen?
3.  **Solutions (Pembahasan) API Security**: We have finalized a **secure, single-API architecture**. The `details.ts` backend route will handle fetching the session details _and_ the solutions, but it will **strictly enforce access control on the server side**.
    - The frontend does NOT pass a parameter to request solutions.
    - Instead, the backend evaluates every question:
      1. If `session.status === 'completed'`, attach the solution.
      2. If `session.mode === 'study'` AND the user has already submitted an answer for this specific question, attach the solution.
4.  **Payload Size (Lazy Loading Architecture)**: As per your decision, we will **NOT** return all questions at once in the `details.ts` API. We will use a **Lazy Loading** approach:
    - **`details.ts` API**: This will only return the session metadata (timer, mode) and a lightweight array for the Navigation Grid (question IDs, order, and their current status: answered/unanswered/ragu-ragu).
    - **New `question.ts` API**: We will create a second endpoint (e.g., `GET /api/exam/sessions/:sessionId/questions/:questionId`) to fetch the heavy HTML content, passage, and options for a specific question _only_ when the user navigates to it.
    - This keeps the initial load incredibly fast and minimizes data usage, while our strict error handling will elegantly block navigation if the connection drops while fetching the next question.
5.  **Error Handling & Network Drops (Keep it Simple)**: You raised a very practical point about network disconnections. Building a system that queues answers while offline is highly complicated.
    - **Proposal (Strict & Simple)**: We will take the simple, secure route. If a user clicks an answer and the background `save-answer` API fails due to no connection:
      1. We instantly block the UI with an error modal (e.g., "Connection Lost. Failed to save answer.").
      2. The user **cannot** proceed to the next question until the connection is restored and the answer successfully saves.
      3. This guarantees 100% data integrity without writing complex offline-sync logic.

## Summary of All Required APIs

To confirm we have everything covered, here are the **6 API endpoints** the Exam Engine will use.

**Existing APIs (No changes needed):**

1.  `POST /start`: Creates the session and scrambles the questions.
2.  `POST /save-answer`: Saves the user's selected option to the database.
3.  `POST /submit`: Ends the exam and calculates the final score.
4.  `POST /abandon`: Forfeits the exam early.

**Missing APIs (We need to build these):** 5. `GET /:id/details`: Returns the lightweight session metadata (timer, score) and the Navigation Grid state. 6. `GET /:id/questions/:questionId`: Returns the heavy HTML question content and options.
_ **Data Conversion (Performance Boost)**: The backend will convert the stored BlockNote JSON arrays into raw HTML strings before sending them to the frontend. This allows the frontend to instantly render the content using `dangerouslySetInnerHTML` without instantiating heavy BlockNote React editors for every question and option.
_ _Study Mode Evaluation_: If the user has already answered this question, this API will evaluate their answer on the backend and return `isCorrect: boolean` along with the `solution` text (also converted to HTML).

## Frontend View & User Experience (`/exam/session/$id.tsx`)

Based on our updated Lazy Loading architecture, here is exactly what the user will see and interact with on the frontend.

### 1. Header (Sticky Top Bar)

- **Left**: Exam Title (e.g., "Tryout UTBK - Sub-test Literasi").
- **Center**: Timer Component.
  - _Tryout_: Strict countdown. Turns red and pulses when `< 5 mins` remain.
  - _Study_: A simple count-up stopwatch (or hidden, depending on design preference).
- **Right Controls**:
  - **Text Size Adjuster**: Small `A- / A+` buttons to increase/decrease question font size for accessibility.
  - **Action Button**: "Submit Exam" (Tryout) or "Finish Study" (Study).

### 2. Main Question Area (Left/Center Column)

- **Loading State**: When moving to a new question, a skeleton loader flashes briefly while the `question.ts` API fetches the content.
- **Question Navigator**: "Question X of Y" header.
- **Passage Area (Optional)**: If the question has a linked `passageId` (like a reading comprehension text), it is displayed here in a scrollable panel.
- **Question Content**: The rich text (BlockNote/HTML) of the question itself.
- **Options Presentation (Hybrid Approach)**:
  1.  **Inline View**: The options (A, B, C, D, E) are displayed below the question with their full text/images. Users _can_ click them directly.
  2.  **Sticky Answer Pad**: Because options can sometimes be very long or contain large images (causing accidental clicks or excessive scrolling), we will add a sticky "Answer Pad" at the bottom of the screen. This pad simply has large, easy-to-click buttons: `[ A ] [ B ] [ C ] [ D ] [ E ]`.
  - _Study Mode Feedback_: Clicking an option locks the UI. A green/red border appears indicating correct/wrong, and the `details` API is refetched to get the solution.
- **Solution Area (Pembahasan)**: _Only visible in Study Mode after answering_. Appears seamlessly below the options once the backend returns it.
- **Bottom Navigation**: Large "Previous" and "Next" buttons.

### 3. Navigation Sidebar (Right Column / Drawer on Mobile)

- **Mobile View**: Hidden inside a floating "Grid" button or a bottom sheet to save screen space.
- **Desktop View**: Fixed on the right side.
- **The Grid**: A matrix of buttons representing all questions.
  - _Tryout Colors_: Gray (Unanswered), Blue (Answered), Yellow (Ragu-ragu).
  - _Study Colors_: Gray (Unanswered), Green (Correct), Red (Wrong).
- **"Ragu-Ragu" Checkbox**: _Only in Tryout Mode_. Allows the user to flag the current question for review later.
- **Color Legend**: A small key explaining what the grid colors mean.

### 4. Critical Modals & UX Features

- **Network Drop Modal**: The blocking error screen we discussed ("Connection Lost").
- **Submit Confirmation Dialog**: If the user clicks "Submit Exam", a modal appears: _"Are you sure? You still have 3 unanswered questions."_
- **Keyboard Shortcuts**: Arrow keys (Left/Right) to navigate questions, letters (A, B, C, D) to select options.

## Verification Plan

- **Design Review**: Ensure the layout is premium (vibrant accents, glassmorphism if applicable, modern typography).
- **Responsive Test**: Verify the Sidebar translates cleanly to a mobile-friendly Drawer/Sheet.
- **Mode Switch Test**: Verify that Study mode strictly locks answers and Tryout mode allows changes and "Ragu-Ragu" marking.
