# Specs & Information: Old Math Master Module

This document outlines the codebase specifications, file map, data flow, and design logic of the old `math_master` Flutter module located in the `test/math_master` directory.

---

## 1. Directory Structure & File Map

The codebase is organized into several key directories under `math_master`:

*   **`lib/`**: Initialization and data seeding.
    *   `lib_math_master.dart`: The Facade/Coordinator class (`LibMathMaster`) which routes request generation and solving tasks.
    *   `data_math_master.dart`: Group lists, grades, topics list definitions, and grouping utilities.
    *   `html_math_master.dart`: Helper classes for formatting math concepts.
*   **`base/`**: Contains core generic classes.
    *   `base_mm_chapter.dart`: The root class (`BaseMmChapter`) for all chapter generators, dealing with random choice generation (Roman, fractions, integers) and question templates.
    *   `base_mm_topic.dart`: The base class (`BaseMmTopic`) for grouping chapters under general topics.
    *   `base_mm_ui.dart`: Abstract screen structure supporting screen lock, orientation changes, and configuration states.
*   **`modules/`**: Mathematical operation chapters.
    *   `addition/`, `subtraction/`, `multiplication/`, `division/`, `roman/`, `fractions/`, `weight/`, `factorization/`, `number/`: Sub-modules representing distinct curriculum components, each containing individual files for 1-digit, 2-digit, negative numbers, missing digits, and simple versions.
*   **`solver/`**: Solver engine.
    *   `calc_steps.dart`, `calc_addition_steps.dart`, `calc_subtraction_steps.dart`, `calc_multiplication_steps.dart`, `calc_division_steps.dart`: Procedural math engine classes that dynamically generate step-by-step math solver layouts in HTML/LaTeX.
    *   `roman_lib.dart`, `calculator_lib.dart`, `factorization_lib.dart`, `measurement_lib.dart`: Core libraries supporting conversions and arithmetic solvers.
*   **`ui/` & `widget/` & `dialog/`**: Presentational layer.
    *   `ui_math_master.dart`: Dashboard showing topics, groups, and grades.
    *   `ui_mm_training.dart`: Primary training interface driving the question-answering session.
    *   `ui_mm_steps_solution.dart`: Popup modal displaying the LaTeX/HTML formatted step-by-step solutions.
    *   `training_board.dart`: Display board rendering the math questions.

---

## 2. Core Execution Flow

```
[ User selects Topic/Chapter ]
             │
             ▼
[ Init ClMmChapter & ModelChapter ] ──► [ Instantiate LibMathMaster ]
                                                   │
                                                   ▼
[ Generate Question (LaTeX) ] ◄── [ Topic / Chapter subclasses newQuestion() ]
             │
             ▼
[ Present to User in Training Screen ]
             │
             ▼
[ User clicks 'Show Solution' ] ──► [ Run Solver (procedural calculation steps) ]
                                                   │
                                                   ▼
                                     [ Generate LaTeX matrix representation ]
                                                   │
                                                   ▼
                                     [ Render in UiMmStepsSolution ]
```

---

## 3. Core Class Specifications

### A. `BaseMmChapter` (`base/base_mm_chapter.dart`)
Acts as the central library of helpers for creating random values and formatted answers. Key responsibilities include:
*   `init()`: Pre-filters selected question types and ranges.
*   `createChoiceInteger()`: Generates random multiple-choice numbers surrounding the correct answer to prevent guess patterns.
*   `createChoiceFractions()`: Handles unique numerator/denominator range selection and mixed fraction formatting.
*   `createQuestionWithHorzLineInt()`: Renders math problems in column addition/subtraction format using LaTeX matrix templates like `\phantom{0}` and `\space`.

### B. `LibMathMaster` (`lib/lib_math_master.dart`)
A routing manager containing the main switchboard. It maps keys like `KeyTopic.topicAddition` to `TopicAddition`, delegating the following operations:
*   `newQuestion()`
*   `updateSolution()`

### C. `CalcSteps` (`solver/calc_steps.dart`)
Renders step-by-step instructions. For example, carrying numbers in addition:
*   Generates a top row representing carry digits colored in gray (`Colors.grey`).
*   Aligns multiple numbers under a horizontal dividing line (`\hline`).
*   Wraps equations in LaTeX matrices (`texMatrix()`) for alignment.

---

## 4. Key Considerations for the New Mobile App

1.  **State Management**: Move state variables currently held in `UiBaseTrainingState` (like `correctAnswer`, `wrongAnswer`, and `questionTotal`) into decoupled, testable Controllers/Blocs.
2.  **Sound Latency**: Preload audio assets rather than loading them dynamically inside button click handlers.
3.  **Scalable Routers**: Swap long switch-case blocks in `LibMathMaster` for a dynamic factory registry system to adhere to the Open-Closed Principle.
