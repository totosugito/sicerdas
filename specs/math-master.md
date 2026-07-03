# Math Master Module: Specs & Dual-Engine Architecture

This document defines the technical specification for implementing the Math Master module in both the **Mobile App** (native Dart) and **Web Frontend** (TypeScript), using a unified **Backend Sync API** to persist scores and verify integrity.

---

## 1. Dual-Engine Architecture Diagram

Both client platforms run their math engines **on-device/client-side** for zero latency, generating random arithmetic problems and step-by-step LaTeX solutions dynamically.

```
┌─────────────────────────────────┐
│       Mobile App (Flutter)      │
│  - Engine written in Dart       ├────────┐
│  - SQLite/Drift offline queue   │        │
└─────────────────────────────────┘        │
                                           ▼ (Unified API Payload & Hashing)
┌─────────────────────────────────┐      ┌─────────────────────────┐
│     Web Frontend (React/Vite)   │ ──►  │    Backend (Node/TS)    │
│  - Engine written in TS         │      │  - DB: pgTable          │
│  - Always online (Direct POST)  │      │  - HMAC-SHA256 Check    │
└─────────────────────────────────┘      └─────────────────────────┘
```

---

## 2. Platform Core Responsibilities

### A. Mobile (Flutter App)
*   **Engine Language**: Pure Dart.
*   **Offline Storage**: SQLite (Drift ORM) with a custom table (`MathMasterScores`) and a migration path (Schema version `2`).
*   **Sync Logic**: Checks connection on launch, batch-posts unsynced records, and updates local records on success.
*   **Directory & Naming Pattern**: Placed under `mobile/lib/ui/math_master/` structured into clean subfolders without redundant prefix names.

### B. Web Frontend (React/Vite)
*   **Engine Language**: TypeScript.
*   **Offline Storage**: None. The web app operates under the assumption of an active network connection.
*   **Sync Logic**: Direct API post immediately upon completing a training session.

### C. Backend (Node.js/TypeScript)
*   **Database**: PostgreSQL table managed by Drizzle ORM (`math_master_scores`).
*   **Verification**: Validates client-side SHA-256 signatures and checks average response speeds to prevent botting.

---

## 3. Mobile Directory Layout & File Structure

Under the root `mobile/lib/ui/math_master/` directory, subfolders omit the `math_master` prefix to avoid redundant paths:

```
mobile/lib/ui/math_master/
├── ui/                                      // Presentational UI layer
│   ├── ui_math_master.dart                  // Main Dashboard / Selection Screen
│   ├── ui_mm_training.dart                  // Live Arithmetic Session Screen
│   ├── ui_mm_steps_solution.dart            // Steps Solution WebView Screen
│   ├── ui_mm_achievement.dart               // Achievements & Streaks Screen
│   └── ui_mm_daily_chart.dart               // Performance Daily Chart Screen
└── libs/                                    // Math Engine Core Logic
    ├── lib_math_master.dart                 // Facade Router class
    ├── base/
    │   ├── base_mm_chapter.dart
    │   └── base_mm_topic.dart
    ├── modules/                             // Sub-chapter generators
    │   ├── addition/
    │   └── subtraction/
    └── solver/                              // Math equation steps calculators
        ├── libs/                            // Core computational helpers
        │   ├── calculator_lib.dart
        │   ├── roman_lib.dart
        │   ├── factorization_lib.dart
        │   └── measurement_lib.dart
        ├── calc_steps.dart                  // Base formatting & LaTeX steps class
        ├── calc_addition_steps.dart
        ├── calc_subtraction_steps.dart
        ├── calc_multiplication_steps.dart
        ├── calc_division_steps.dart
        ├── fraction_steps.dart
        ├── factorization_steps.dart
        ├── roman_steps.dart
        ├── measurement_steps.dart
        ├── percent_steps.dart
        └── clock_steps.dart
```

---

## 4. Gamification & Child-Friendly Design Specs (Ages 5-15)

To make math practice engaging, readable, and highly educational for children:

### A. Conversational Step-by-Step Explanations
Instead of displaying dry equations, the solver engine generates **friendly, interactive text walkthroughs** above or alongside each step.
*   **Example for Addition Carry**:
    *   *Step 1*: "Let's start from the right column! Add the ones: $8 + 5 = 13$."
    *   *Step 2*: "Write down **3** in the ones column, and carry **1** to the tens column."
    *   *Step 3*: "Now add the tens: $1$ (carry) $+ 1 + 2 = 4$."

### B. High-Contrast Column Coloring
*   **Carries**: Rendered in a bright, friendly green (`Colors.green`) or soft light blue.
*   **Borrowing / Cancellations**: Struck-through numbers are rendered in red/orange (`Colors.orangeRed`) to clearly signal value shifts.
*   **Columns Alignment**: Vertical numbers are aligned with clean visual gridlines so younger students can visualize place value (Ones, Tens, Hundreds).

### C. Visual UX Rewards
*   Include subtle animations (like a bounce effect when an answer is correct).
*   Add encouraging text (e.g., *"Awesome job!"*, *"Keep it up!"*) based on correct/wrong answers.

---

## 5. Database Schema Definitions

### Mobile (Drift - Dart)
```dart
import 'package:drift/drift.dart';

class MathMasterScores extends Table {
  TextColumn get id => text()();                     // Client-generated UUID (Primary Key)
  TextColumn get chapterKey => text()();             // e.g. "addition2Digit"
  IntColumn get correctCount => integer()();
  IntColumn get wrongCount => integer()();
  IntColumn get elapsedSeconds => integer()();
  DateTimeColumn get completedAt => dateTime()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}
```

---

## 6. API & Security Specifications

### `POST /api/math-master/sync`

*   **Endpoint**: `/api/math-master/sync`
*   **Payload**:
    ```json
    {
      "scores": [
        {
          "id": "c8b7465b-efbe-419b-a36c-9c3f0c1d683a",
          "chapterKey": "addition2Digit",
          "correctCount": 9,
          "wrongCount": 1,
          "elapsedSeconds": 120,
          "completedAt": "2026-07-03T02:40:00.000Z",
          "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      ]
    }
    ```

### Signature Hashing (Anti-Tampering)
Both Web and Mobile clients must compute a SHA-256 hash using a shared secret salt. The backend recalculates the hash to verify data integrity.

*   **Hashing Pattern**:
    `payload = "$id|$chapterKey|$correctCount|$wrongCount|$elapsedSeconds|$secretSalt"`

#### Client implementation (TypeScript / Web):
```typescript
import crypto from "crypto";

function generateHash(score: {
  id: string;
  chapterKey: string;
  correctCount: number;
  wrongCount: number;
  elapsedSeconds: number;
}): string {
  const secretSalt = "S1c3rd4sM4thM4st3rS3cr3t!";
  const payload = `${score.id}|${score.chapterKey}|${score.correctCount}|${score.wrongCount}|${score.elapsedSeconds}|${secretSalt}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}
```

#### Server Verification & Speed Checks:
```typescript
import crypto from "crypto";

function verifyAndSave(score: any) {
  const secretSalt = "S1c3rd4sM4thM4st3rS3cr3t!";
  const payload = `${score.id}|${score.chapterKey}|${score.correctCount}|${score.wrongCount}|${score.elapsedSeconds}|${secretSalt}`;
  const expectedHash = crypto.createHash("sha256").update(payload).digest("hex");
  
  if (score.hash !== expectedHash) {
    throw new Error("Data integrity error: Signature mismatch.");
  }
  
  // Speed check: Reject if average duration is less than 1.0 second per question
  const totalAnswers = score.correctCount + score.wrongCount;
  if (score.elapsedSeconds < totalAnswers * 1.0) {
    throw new Error("Anomaly detected: Score submission is too fast.");
  }
}
```

---

## 7. Backend Database Schema (Drizzle ORM)

```typescript
import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "../auth/users";

export const mathMasterScores = pgTable("math_master_scores", {
  id: uuid("id").primaryKey(), // Client-generated UUID (Prevents duplicate sync writes)
  userId: uuid("user_id").references(() => users.id).notNull(),
  chapterKey: text("chapter_key").notNull(),
  correctCount: integer("correct_count").notNull(),
  wrongCount: integer("wrong_count").notNull(),
  elapsedSeconds: integer("elapsed_seconds").notNull(),
  completedAt: timestamp("completed_at").notNull(),
});
```
