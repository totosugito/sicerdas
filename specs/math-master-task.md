# Math Master Implementation Task List

This document lists the step-by-step tasks required to migrate, optimize, and integrate the `math_master` module across the mobile app, backend, and web frontend.

---

## Phase 0: Vertical Slice / Proof-of-Concept (Addition 1-Digit)
Implement and test the entire end-to-end pipeline using *only* the 1-digit addition module (`addition_1_digit.dart`) before porting the other chapters.

- [x] **0.1. Setup Core Directories & Files**
  - [x] Create base directories under `mobile/lib/ui/math_master/`.
  - [x] Port base files: `base_mm_chapter.dart`, `base_mm_topic.dart`, and the router `lib_math_master.dart`.
- [x] **0.2. Port Addition 1-Digit Chapter & Solver**
  - [x] Port `addition_1_digit.dart` to `libs/modules/addition/`.
  - [x] Port the base solver `calc_steps.dart` and `calc_addition_steps.dart` (for generating carry steps solutions).
- [x] **0.3. Setup Local Drift Database Table**
  - [x] Create `math_master_scores.dart` table.
  - [x] Register it in `@DriftDatabase` and implement the migration strategy (Schema v2).
- [x] **0.4. Build UI flow for Training & Solution**
  - [x] Port and refactor `ui_math_master.dart` (Dashboard displaying the single 1-digit addition option).
  - [x] Port and refactor `ui_mm_training.dart` with timer, scoring, keypad input, and state management.
  - [x] Port and refactor `ui_mm_steps_solution.dart` rendering the step-by-step LaTeX/HTML solution.
  - [x] Port and refactor `ui_mm_achievement.dart` for scoring milestones.
  - [x] Port and refactor `ui_mm_daily_chart.dart` displaying score trends.
- [ ] **0.5. Implement Hashing & Backend Sync**
  - [ ] Implement SHA-256 signature generator on mobile.
  - [ ] Define PostgreSQL table and build `POST /api/math-master/sync` on the backend with signature validation and speed limits.
  - [ ] Verify score is saved locally when offline, and synced to server on application reload or once online.

---

## Phase 1: Mobile App Rewrite (Flutter)
Once the Phase 0 pipeline is tested and working, port the remaining modules and solvers on the mobile app.

- [ ] **1.1. Port Solver Helper Libraries (`libs/solver/libs/`)**
  - [ ] Port `calculator_lib.dart`
  - [ ] Port `roman_lib.dart`
  - [ ] Port `factorization_lib.dart`
  - [ ] Port `measurement_lib.dart`
- [ ] **1.2. Port Remaining Step Solvers (`libs/solver/`)**
  - [ ] Port `calc_subtraction_steps.dart`
  - [ ] Port `calc_multiplication_steps.dart`
  - [ ] Port `calc_division_steps.dart`
  - [ ] Port `fraction_steps.dart`
  - [ ] Port `factorization_steps.dart`
  - [ ] Port `roman_steps.dart`
  - [ ] Port `measurement_steps.dart`
  - [ ] Port `percent_steps.dart`
  - [ ] Port `clock_steps.dart`
- [ ] **1.3. Port Remaining Sub-modules (`libs/modules/`)**
  - Port each mathematical operation module and its corresponding sub-chapters:
  - [ ] Port **Addition** chapters (`libs/modules/addition/` - e.g., 2-digit, sequential)
  - [ ] Port **Subtraction** (`libs/modules/subtraction/`)
  - [ ] Port **Multiplication** (`libs/modules/multiplication/`)
  - [ ] Port **Division** (`libs/modules/division/`)
  - [ ] Port **Number Basics** (`libs/modules/number/`)
  - [ ] Port **Fractions** (`libs/modules/fractions/`)
  - [ ] Port **Factorization** (`libs/modules/factorization/`)
  - [ ] Port **Roman Numerals** (`libs/modules/roman/`)
  - [ ] Port **Weight** (`libs/modules/weight/`)
  - [ ] Port **Length** (`libs/modules/length/`)
  - [ ] Port **Percents** (`libs/modules/percents/`)
  - [ ] Port **Clock** (`libs/modules/clock/`)
- [ ] **1.4. Apply Gamification & Child-Friendly Details**
  - [ ] Add animations (e.g. bounce effect) upon entering a correct answer.
  - [ ] Render encouraging messages alongside result alerts.
  - [ ] Apply high-contrast grid layouts to column arithmetic questions.

---

## Phase 2: Backend Development (Node.js/TypeScript)
No additional tasks needed if Phase 0 is complete. (Double-check analytics aggregates if applicable).

---

## Phase 3: Web Frontend Development (React/Vite)
Port the math logic to TypeScript for browser-level execution and hook it into the backend sync API.

- [ ] **3.1. Convert Math Engine to TypeScript**
  - Rewrite each mathematical operation module into TypeScript:
  - [ ] Port **Addition** to TS (incorporating colored columns and child-friendly text annotations)
  - [ ] Port **Subtraction** to TS
  - [ ] Port **Multiplication** to TS
  - [ ] Port **Division** to TS
  - [ ] Port **Number Basics** to TS
  - [ ] Port **Fractions** to TS
  - [ ] Port **Factorization** to TS
  - [ ] Port **Roman Numerals** to TS
  - [ ] Port **Weight** to TS
  - [ ] Port **Length** to TS
  - [ ] Port **Percents** to TS
  - [ ] Port **Clock** to TS
- [ ] **3.2. Implement UI Math Master Page**
  - [ ] Create React components for the topic dashboard and live training page.
  - [ ] Integrate LaTeX rendering libraries for displaying solutions.
- [ ] **3.3. API Integration**
  - [ ] Generate the SHA-256 signature on session completion.
  - [ ] Make direct `POST` calls to `/api/math-master/sync` immediately on training completion.

---

## Phase 4: Integration testing & Validation
Validate the end-to-end flow.

- [ ] **4.1. Local & Remote Score Sync Tests**
  - [ ] Complete offline sessions on mobile and verify sync is successful on application restart.
  - [ ] Complete online sessions on web and verify instant database insertion.
- [ ] **4.2. Security Auditing**
  - [ ] Attempt tampered score postings (e.g., editing correct count or response times via Postman) and verify backend rejection.
