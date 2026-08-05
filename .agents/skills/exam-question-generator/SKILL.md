---
name: exam-question-generator
description: Converts markdown question files into BlockNote-formatted JSON for the exam system. Use when asked to generate exam questions, parse question markdown, create questions.json, convert question files to JSON, or extract soal from markdown.
---

# Exam Question Generator Skill

Converts markdown source files containing raw exam questions into strictly valid BlockNote JSON for the sicerdas exam system.

## When to Use

- User asks to "generate questions from this markdown"
- User asks to "convert soal to JSON"
- User asks to "parse/extract questions from a file"
- User provides a `.md` file and wants `questions.json` output

## Workflow

### Step 1 — Read References

Before generating any output, read these reference files to understand the exact schema:

1. `references/blocknote-schema.md` — All valid block/inline types and their JSON structures
2. `references/quality-rules.md` — Question quality, scoring, and formatting rules
3. `examples/output-sample.json` — Concrete example of valid output

### Step 2 — Read and Parse the Source File

1. Read the user's markdown file using `view_file`.
2. Identify each distinct question by looking for numbered items (e.g., `1.`, `2.`), options (e.g., `(a)`, `(b)`), and LaTeX expressions (`$...$` or `$$...$$`).
3. Strip question numbers — the system handles ordering.

### Step 3 — Determine Question Metadata

For each question, determine:

| Field | How to Decide |
|-------|--------------|
| `type` | Has options → `multiple_choice` or `multiple_select`. No options → `essay`. Has Benar/Salah → `statement_reasoning`. |
| `difficulty` | Recall/memorization → `easy`. Application → `medium`. Analysis/HOTS → `hard`. |
| `scoringStrategy` | Default `all_or_nothing`. Use `partial` only for `multiple_select` or `essay`. |
| `tags` | 1–3 broad topic tags in Bahasa Indonesia (e.g., `"Trigonometri"`, `"Logaritma"`). |

### Step 4 — Convert to BlockNote JSON

Follow these critical rules:

1. **All text must be inside block objects.** Never put `{"type": "text"}` at the root of a `content` array. Always wrap in `paragraph`, `heading`, `bulletListItem`, `equation`, or `alert`.

2. **Math rendering — two types:**
   - **Block-level (standalone formula):** Use `{"type": "equation", "props": {"latex": "..."}, "content": []}`.
   - **Inline (within text):** Use `{"type": "latex", "props": {"latex": "...", "displayMode": false}}` inside a `paragraph` block's `content` array.

3. **Option Formatting:** If an option consists of a number, variable, or math formula, you MUST format it as a `paragraph` block containing an inline `latex` object (with `"displayMode": false`), NOT as an `equation` block. Equation blocks render full-width and look bad for short options.

4. **LaTeX conversion:** Strip `$` and `$$` wrappers from the source. Put the raw LaTeX into the `latex` prop.

5. **Language:** All text output (questions, options, solutions, tags) must be in **Bahasa Indonesia** with proper **EYD** spelling.

6. **Variable Formulas (CRITICAL for math):** Always parameterize math questions! Do not leave `variableFormulas: null` for calculation questions. Scan the equations for constants (e.g., base numbers like 2020, coefficients like 3, evaluated points like $f(2)$). Replace these constants with placeholders like `{{a}}`, `{{b}}` inside the LaTeX strings (e.g., `\log_{{{a}}} ({{b}}x)`). Generate 3-5 distinct sets of valid values in `variableFormulas.variables`, ensuring mathematical rules (like log domains) remain valid. Include `opt1`, `opt2`, etc., in the variables. **CRITICAL FOR `variableFormulas.solutions`:** Write formulas as plain math expressions with bare variable names (e.g., `"b * x_val - c"` or `"a + b"`). DO NOT wrap variables in mustache braces like `"{{b}} * {{x_val}} - {{c}}"` in `variableFormulas.solutions`, as this will crash the formula evaluator engine with a `SyntaxError`.

### Step 5 — Generate Solutions (Pembahasan)

**This is critical.** Solutions are for school students, so they must be highly structured and easy to read:

1. **Complete and sequential** — Never skip steps. Use `Diketahui → Ditanya → Pembahasan` structure.
   - For the "Diketahui:" section, write `"Diketahui:"` as a bold paragraph, followed by a bulleted list (`bulletListItem` blocks) for each given variable/equation. Do not put all given info in a single long line.
   - For the "Pembahasan:" section, write `"Pembahasan:"` as a standalone bold paragraph. Start the actual explanation text on a NEW paragraph below it. Do not combine the label and the explanation in one line.
2. **Multi-solution** — Always provide a conceptual solution (`solutionType: "general"`). If a valid shortcut or logical trick exists, you MUST provide a fast method (`solutionType: "fast_method"`).
3. **Step-by-step Numbering & Detailed Reasoning (CRITICAL):** 
   - Every step in the solution MUST be a native `"numberedListItem"` block.
   - DO NOT write words like `"Langkah pertama"`, `"Langkah 1"`, or `"1. "` inside the text string, as the `"numberedListItem"` already renders the step number badge automatically.
   - To keep the list numbering continuous (1, 2, 3...), ALL sub-blocks for a step (including `"equation"` and `"alert"` blocks) MUST be placed inside the `"children"` array of that step's `"numberedListItem"`.
4. **Concept Reminders (Callouts)** — Insert an `alert` block (`type: "tip"`) inside a step's `children` array to highlight a formula. The alert must be extremely concise. **CRITICAL JSON FORMAT:** If the alert contains a math formula, you MUST split the `content` array. Do not put raw LaTeX inside the `text` string! Example: `content: [{"type": "text", "text": "Ingat Sifat: "}, {"type": "latex", "props": {"latex": "a^{\\log_a b} = b", "displayMode": false}}]`. **NOTE:** DO NOT include emojis (like 💡 or 🚀) in the text, as the UI already renders an icon automatically.
5. **Multi-line Equations** — For key formulas and calculations, use `equation` blocks. **CRITICAL:** If a calculation involves multiple steps (e.g., A = B = C), DO NOT write it horizontally in one long line. You MUST use the LaTeX `\begin{aligned} ... \end{aligned}` environment to break it into multiple lines aligned at the equals sign (`&=`).
6. **Use inline latex** when referencing variables/values within explanatory text.
7. **Bold labels only** — Use `{"bold": true}` only for labels like `"Diketahui:"` and step numbers (`"1. "`).
8. **Universal Conclusion** — The final concluding paragraph of ANY solution (general or fast method) must ALWAYS be exactly: `"Jadi, jawaban yang benar adalah [hasil]."`. Never use weird phrasing like "jawaban cepatnya".
9. **No Option Letters (CRITICAL)** — Since option positions will be randomized in the database, NEVER reference the option letter (e.g., "opsi D", "jawaban A") in the solution. Just state the final correct value.
10. **Friendly Tone (CRITICAL)** — Do not use stiff or robotic language. Use a friendly, natural, and conversational teaching style suitable for Indonesian school children.

### Step 6 — Output

1. Write the JSON to the path requested by the user (or suggest `questions-output.json` in the same directory as the source).
2. Validate with: `python3 -m json.tool <output_file> > /dev/null`
3. Report the number of questions generated and any issues.

## CRITICAL: Common Mistakes to AVOID

```
❌ BAD:  "content": [{"type": "text", "text": "...", "styles": {}}]
✅ GOOD: "content": [{"type": "paragraph", "content": [{"type": "text", "text": "...", "styles": {}}]}]

❌ BAD:  "type": "math", "props": {"equation": "..."}
✅ GOOD: "type": "equation", "props": {"latex": "..."}

❌ BAD:  Mixing "$x^2$" in text strings
✅ GOOD: Split into text + inline latex: {"type": "text"}, {"type": "latex", "props": {...}}, {"type": "text"}

❌ BAD:  Solusi pendek satu paragraf
✅ GOOD: Solusi lengkap: Diketahui, Ditanya, Pembahasan bertahap dengan equation blocks
```
