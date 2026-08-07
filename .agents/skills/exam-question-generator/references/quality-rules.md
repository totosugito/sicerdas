# Quality Rules & Formatting Guidelines

## Bahasa Indonesia Requirements

- All output text (question content, options, solutions, and tags) must be written in **standard Bahasa Indonesia** following **EYD** (Ejaan yang Disempurnakan) rules.
- Use clear, straightforward language suitable for Indonesian school students.
- Avoid informal language, slang, or unnecessary English terms.

## Dynamic Variables (Computational Questions)

For questions involving calculations or mathematical functions, you **MUST** parameterize the question:

1. **Convert Number Words to Digits & Avoid Hardcoding**: If numbers are written as words in the question text (e.g., "Dua detik", "Tiga buah"), you **MUST** convert them to numeric digits ("2 detik", "3 buah") in the JSON text strings so they can be parameterized with placeholders like `{{a}}`. Scan all constant numbers and replace them with placeholders like `{{a}}`, `{{b}}`, etc.
2. Place these placeholders **inside** the `latex` prop (e.g., `\log_{{{a}}} ({{b}}x - {{c}})` or `{{t}} \text{ detik}`).
3. Populate `variableFormulas.variables` with **at least 5 realistic sets** of numbers to maximize question variations. Ensure generated number sets satisfy all mathematical constraints (e.g., logarithm bases must be positive and $\neq 1$, arguments inside logarithms must be positive).
4. Include calculations for plausible incorrect options/distractors (`opt1`, `opt2`, etc.) in the variables array.
5. Write formulas in `variableFormulas.solutions` using plain mathematical expressions with bare variable names (e.g., `"b * x_val - c"` or `"a + b"`). **DO NOT** use mustache braces like `"{{b}} * {{x_val}} - {{c}}"` as this will cause a `SyntaxError` in the formula evaluator.

Set `variableFormulas: null` ONLY for pure conceptual/theoretical questions (e.g., "Who discovered gravity?").

## Tone & Pedagogical Style

You **MUST** adopt a friendly, natural, and conversational teaching tone, as if a teacher is explaining to students in class:
- **Extract Key Terms & Implicit Information**: Always explain implicit meanings in the "Diketahui:" section. For instance, "berhenti" implies final velocity $v = 0$, and "dilepas" implies initial velocity $v_0 = 0$. Provide explicit explanatory notes for students.
- **Detailed Step-by-Step Explanation**: Do not just give brief mathematical commands (e.g., "Substitute..."). Explain the *reasoning* behind each step, especially in the "Konsep dan Rumus Dasar" section.
- **AVOID** stiff, purely instructional, or robotic phrasing.
- **Use smooth transitions** between steps (e.g., *"Nah, setelah rumusnya dapat, kita masukkan nilainya..."*).

## Options Formatting & Scoring Logic

1. **Numeric/Formula Option Formatting:** If an option consists of a number, variable, or math formula, the option **MUST** be formatted as a `paragraph` block containing an inline `latex` object (`displayMode: false`), NOT as an `equation` block. `equation` blocks render full-width and break the UI layout.

| Type | maxScore | Option scoring |
|------|----------|---------------|
| `multiple_choice` | `1` | Correct option: `score: 1`. Others: `score: 0`. |
| `multiple_select` | Total correct options | Each correct option: `score: 1`. Incorrect: `score: 0`. |
| `essay` | Defined by rubric (e.g., `5`) | No options. Rubric score sum in solution must equal maxScore. |
| `statement_reasoning` | `1` | Exactly 2 options: "Benar" (order 1) and "Salah" (order 2). |

## Statement Reasoning (Pernyataan-Sebab)

If the source format contains `"Pernyataan SEBAB Alasan"`:

1. Text BEFORE "SEBAB" → goes into the `content` field.
2. Text AFTER "SEBAB" → goes into the `reasonContent` field.
3. **DO NOT** include the word "SEBAB" in either field.
4. The solution must analyze BOTH parts separately:
   - Paragraph 1: `"Pernyataan BENAR/SALAH: "` (bold) + explanation (normal text)
   - Paragraph 2: `"Alasan BENAR/SALAH: "` (bold) + explanation (normal text)

## Solutions (Pembahasan) — CRITICAL

Solutions are written for **school students**. They must be **complete, sequential, and easy to understand**.

### Mandatory Structure for Math/Physics Calculation Questions

```
Solution 1 (solutionType: "general"):
  Paragraph 1: "Diketahui:" (bold)
  ["bulletListItem" Blocks]: Use bullet points for each variable. **MANDATORY IMPLICIT INFO EXTRACTION**: Spell out hidden keywords (e.g., "dilepas" -> $v_0 = 0$) and standard assumptions (e.g., $g = 10$).
  Paragraph 2: "Ditanya:" (bold) + target variable/question
  Paragraph 3: "Konsep dan Rumus Dasar:" (bold) (Standalone header)
  Paragraph 4: ["paragraph" Block] **MANDATORY THEORY EXPLANATION.** Narratively explain the core concepts and general formulas in a friendly tone BEFORE calculating.
  Paragraph 5: "Langkah Penyelesaian:" (bold) (Standalone header)
  
  ["alert" Block type "tip" (Optional)]: Contains short formulas or reminders (e.g., "Ingat Sifat Logaritma: ..."). Use "tip" type so the yellow lightbulb icon renders. **CRITICAL:** The alert's text and inline latex nodes MUST be placed directly inside `alert.content`. NEVER leave `content: []` empty on an `alert` block! DO NOT add emojis (like 💡) as the UI provides icons automatically. DO NOT put long narrative explanations inside callout alerts.
  
  ["numberedListItem" Blocks]: Use this for ALL solution steps.
  - **CRITICAL — NO EMPTY CONTENT:** The primary line/first text of the step MUST be placed directly inside the `"numberedListItem"` block's own `"content"` array. NEVER leave `"content": []` empty on a `"numberedListItem"` and put the sentence in a child `"paragraph"` block in `children`, as BlockNote will render an empty item with placeholder text like *"List"* next to the number badge.
  - **Steps Containing Formula Without Introductory Text:** Ideally every step has introductory narrative text. However, if a step genuinely consists ONLY of a math equation without introductory text, DO NOT create an empty `numberedListItem` with an `equation` in `children`. Put the formula directly inside `numberedListItem.content` as an inline `latex` object: `content: [{"type": "latex", "props": {"latex": "...", "displayMode": false}}]` with `children: []`.
  - DO NOT write words like "Langkah pertama", "Langkah 1", or "1. " in the text string because step numbers are automatically rendered by the list item badge.
  - The `children` property is used ONLY for subsequent sub-blocks belonging to that step (such as standalone `"equation"` blocks, `"alert"` callouts, or secondary sub-paragraphs) to ensure sequential step numbering (1, 2, 3...) remains contiguous.
  
  ["equation" Block]: Used for mathematical calculations. IF inside a numbered step, MUST be placed in the `children` array of that step.
  **CRITICAL FOR MULTI-LINE EQUATIONS:** If a calculation spans multiple simplification steps, DO NOT write it horizontally in one long line. You MUST use the LaTeX `\begin{aligned} ... \end{aligned}` environment. **DO NOT repeat the left-hand variable on subsequent lines!**
  - CORRECT: `\begin{aligned} s &= 0 + ... \\ &= 5(4) \\ &= 20 \text{ m} \end{aligned}`
  - INCORRECT: `\begin{aligned} s &= 0 + ... \\ s &= 5(4) \\ s &= 20 \text{ m} \end{aligned}`
  
  Final Paragraph (APPLIES TO ALL SOLUTION TYPES): Must ALWAYS end with this exact sentence format: `"Jadi, jawaban yang benar adalah [hasil]."` (Use inline latex or bold for the result value). DO NOT use weird variations like "jawaban cepatnya", "maka hasilnya", etc. NEVER reference option letters (e.g., "opsi D") as option positions are randomized.

Solution 2 (solutionType: "fast_method") — OPTIONAL:
  Only if a valid shortcut exists.
  Paragraph 1: ["alert" Block type "success" or "tip"] Contains the shortcut name/formula inside `alert.content`.
  Paragraph 2: ["paragraph" Block] **MANDATORY EXPLANATION.** Narratively explain how the shortcut formula applies to this problem before calculating. DO NOT jump directly from alert to an equation block.
  Paragraph 3: ["equation" Block] Mathematical calculation (use `\begin{aligned}` for multi-line steps).
  Paragraph 4: "Jadi, jawaban yang benar adalah [hasil]."
```

### Bold Styling Rules

- **ONLY** bold labels (`"Diketahui:"`, `"Ditanya:"`, `"Jawaban:"`)
- **NEVER** bold entire paragraphs
- Separate labels and text into two distinct `text` objects:

```json
[
  {"type": "text", "text": "Diketahui: ", "styles": {"bold": true}},
  {"type": "text", "text": "massa benda m = 5 kg, percepatan gravitasi ...", "styles": {}}
]
```

## Plausible Distractors

For `multiple_choice` and `multiple_select`, incorrect options **MUST be plausible**:
- Results derived from common student misconceptions (wrong sign, unit conversion errors)
- Results from almost-correct calculation steps
- **NOT** arbitrary or obviously random numbers

## Tags (Categorization)

- 1–3 tags per question in Bahasa Indonesia
- Use broad, general topic tags rather than specific question numbers
- Good examples: `"Trigonometri"`, `"Logaritma"`, `"Kinematika"`, `"Bangun Ruang"`
- Bad example: `"Soal Nomor 3 Halaman 45"`

## Anti-Hallucination

1. If text/symbols are unreadable → write `[UNREADABLE]`.
2. If a question can be extracted but **cannot be solved with certainty** → still generate JSON, but set `solutions: []` and all options `isCorrect: false`.
3. If a question is completely unintelligible → return a plain text error message, do NOT create fake JSON.

## Clean Extraction

- Strip question numbers from source (`"1."`, `"Soal 5:"`, etc.)
- Strip LaTeX wrappers `$` and `$$` — place raw LaTeX inside the `latex` prop
- Maintain clean separation between text and math expressions

## Image Handling (Auto-Search SVG & Diagram Context Inspection)

When source markdown contains an image reference (e.g., `![diagram](soal-01.png)` or `soal-01.jpg`):
1. **Mandatory Diagram Inspection:** The agent MUST open and inspect the SVG or image file (`view_file`)! Essential numerical parameters (e.g., angle $\theta$, height $h$, force $F$, or chart labels) are **frequently contained only inside the diagram** and omitted from the markdown text. Extract all parameters from the diagram and include them in `Diketahui:` and `variableFormulas`.
2. **Search for Companion SVG File:** Look for a file with the same base name but `.svg` extension (e.g., `soal-01.svg`) in the same directory.
3. **If `.svg` file exists:**
   - Read the SVG file content.
   - Encode as Data URI string: `data:image/svg+xml;utf8,<svg ...>`.
   - Insert as an `image` block in BlockNote `content`:
     ```json
     {
       "type": "image",
       "props": {
         "url": "data:image/svg+xml;utf8,<svg ...>",
         "caption": "Deskripsi gambar"
       },
       "content": []
     }
     ```
4. **If `.svg` file is missing** (only raster `.jpg`/`.png` exists), log a `[MISSING_SVG]` warning in the output report so the user knows an SVG vector version is needed.
