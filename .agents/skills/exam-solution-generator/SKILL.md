---
name: exam-solution-generator
description: Reads raw exam question markdown files and generates complete pedagogical solutions with parameterization. Outputs enriched structured markdown to the solution/ folder. Use when asked to generate solutions, buat pembahasan, solve questions, or create solution files from raw exam questions.
---

# Exam Solution Generator Skill

Reads raw single-question markdown files from the `ori/` folder, generates complete pedagogical solutions with variable parameterization, and writes enriched structured markdown files to the `solution/` folder.

## When to Use

- User asks to "generate solutions from questions"
- User asks to "buat pembahasan dari soal"
- User asks to "solve these questions and save solutions"
- User provides raw `.md` question files and wants solution files

## Workflow

### Step 1 — Read References

Before generating any output, read these reference files to understand the exact format and rules:

1. `references/solution-format-spec.md` — The intermediate markdown format specification
2. `references/quality-rules.md` — Solution quality, equation formatting, and parameterization rules

### Step 2 — Read and Parse the Source File

1. Read the clean single-question `.md` file (from the `ori/` folder).
2. Identify question content by looking for numbered items (e.g., `1.`), options (e.g., `(a)`, `(b)`), and LaTeX expressions (`$...$` or `$$...$$`).
3. Strip question numbers — the system handles ordering.
4. If the question references an image (e.g., `![caption](image.jpg)`):
   - **CRITICAL — Inspect Diagram Information:** Always inspect the SVG or image file using `view_file`! Diagrams often contain essential numbers, angles, vector labels, or given values (e.g., $v_0 = 20\text{ m/s}$, $\theta = 45^\circ$) that are NOT written in the markdown text.
   - Extract these diagram parameters and include them in `**Diketahui:**` and parameterize them in `variableFormulas`.
   - Keep the `![caption](file.png)` reference in the output markdown — the blocknote converter will handle SVG embedding later.

### Step 3 — Determine Question Metadata

For each question, determine the YAML frontmatter fields:

| Field | How to Decide |
|-------|--------------:|
| `type` | Has options → `multiple_choice` or `multiple_select`. No options → `essay`. Has Benar/Salah → `statement_reasoning`. |
| `difficulty` | Recall/memorization → `easy`. Application → `medium`. Analysis/HOTS → `hard`. |
| `maxScore` | Default `1` for single-answer MC or SR. Sum of scores for `multiple_select`. Rubric total for `essay`. |
| `scoringStrategy` | Default `"all_or_nothing"`. Use `"partial"` only for `multiple_select` or `essay`. |
| `requiredTier` | Default `"free"`. Use `"pro"` or `"enterprise"` if specified. |
| `isActive` | Default `true`. |
| `tags` | 1–3 broad topic tags in Bahasa Indonesia. **CRITICAL:** If the markdown source contains a chapter/section header (e.g., `# BAB 7: GETARAN DAN GELOMBANG`), ALWAYS extract the chapter title (e.g., `"Getaran dan Gelombang"`) as the primary tag, alongside specific sub-topic tags (e.g., `"Pegas"`). |

### Step 4 — Generate Variable Parameterization

For math/calculation questions, you **MUST** parameterize:

1. **Scan all constants** in the question and replace with placeholders like `{{a}}`, `{{b}}`, `{{x}}`.
2. **Convert number words to digits** (e.g., "Dua detik" → "2 detik") so they can be parameterized.
3. **Generate at least 5 distinct variable sets** that satisfy all mathematical constraints (log domains, positive denominators, no division by zero).
4. **Include distractor options** (`opt1`, `opt2`, etc.) — make them plausible based on common student mistakes.
5. **Define intermediate calculations** in `variableFormulas.solutions` with bare mathjs expressions:
   - ✅ `"term1": "3 * x"`, `"answer": "3 * x + 7"`
   - ❌ `"term1": "3 * {{x}}"` (no mustache braces in solution formulas!)
   - ❌ `"answer": "Math.sqrt(x)"` (no `Math.` prefix! Use bare `sqrt(x)`)
   - Use `mathjs` functions directly: `sqrt()`, `abs()`, `log()`, `pow()`, `sin()`, `cos()`

Set `variableFormulas: null` ONLY for pure conceptual/theoretical questions.

### Step 5 — Generate Solutions

Write complete pedagogical solutions following the rules in `references/quality-rules.md`:

#### Solution 1: `## Pembahasan: Cara Konseptual` (MANDATORY)

**Image Placement Rule (CRITICAL):** 
- **Original OCR Diagrams:** The original image MUST ONLY be placed inside the `## Soal` section (maintaining its exact position relative to the question text). **DO NOT** duplicate or embed the original raw OCR image again inside the `## Pembahasan` section! It is highly redundant since the user already sees it in the question block.
- **Auto-Illustrations:** If (and ONLY if) it's a *newly generated* illustration specifically for the solution, embed it where it fits best logically inside `## Pembahasan` (e.g., inside `**Konsep Singkat:**` or the start of `**Langkah Penyelesaian:**`), followed immediately by the text explaining it. 
- NEVER dump any images at the very bottom of the solution without context.

Must follow this structure:

1. **`**Diketahui:**`** (bold label) followed by bullet list
   - List all known variables
   - **CRITICAL:** Extract implicit hidden variables (e.g., "dilepas" = $v_0 = 0$, "berhenti" = $v = 0$)
   - Include standard assumptions (e.g., $g = 10$ m/s²)

2. **`**Ditanya:**`** (bold label) + target variable/question

3. **`**Konsep Singkat:**`** (bold label, standalone paragraph)
   - **MANDATORY:** Explain the core concept using very simple, easy-to-understand language and analogies suitable for SD-SMA students BEFORE calculating

4. **`**Langkah Penyelesaian:**`** (bold label, standalone paragraph)
   - Optional: `> **Tip:**` callout with concise formula reminder (no emojis!)
   - Numbered steps `1.`, `2.`, `3.` if multi-step, or regular paragraph if single step
   - Each step should include friendly, easy-to-digest introductory narrative text AND equation blocks (`$$...$$`)

5. **Conclusion:** `Jadi, jawaban yang benar adalah ${{answer}}$.` (or bold text result for prose answers)

#### Solution 2: `## Pembahasan: Trik Cepat` (OPTIONAL)

Include when a genuine calculation shortcut exists. Structure:
1. `> **Tip:**` callout with concrete formula/shortcut equation (omit callout if no distinct formula shortcut exists)
2. Paragraph explaining how the shortcut applies
3. Equation block with calculation
4. Conclusion: `Jadi, jawaban yang benar adalah ${{answer}}$.`

Omit `Trik Cepat` ONLY for pure conceptual, definition, or direct recall questions where no shortcut applies.

#### Equation & Solution Quality Rules

See `references/quality-rules.md` for full rules on:
- Multi-phase breakdown (`$$` block per phase)
- Reciprocal inversion inside the same `\begin{aligned}` block
- Vertical TeX equation layout (single `=` per line, `&=` per line, no horizontal chains, LHS variable on line 1 only)
- Intermediate calculation steps & parameterization using `{{placeholder}}` syntax. **CRITICAL LATEX RULE:** If a placeholder is used inside a subscript or superscript, you MUST wrap the placeholder in extra LaTeX curly braces: `_{{{placeholder}}}` or `^{{{placeholder}}}` (e.g., `\log_{{{a}}}`, NOT `\log_{{a}}`). Otherwise, multi-digit numbers will render brokenly (e.g. `\log_2020`).
- Statement Reasoning (`Pernyataan SEBAB Alasan`) handling

### Step 6 — Write Output File

1. Write the enriched markdown to the `solution/` subfolder of the target directory.
2. Use the same filename as the source (e.g., `ori/q01.md` → `solution/q01.md`).
3. **CRITICAL:** The output file MUST contain the complete question structure, NOT just the `## Pembahasan`. You MUST write the parameterized `## Soal` and `## Opsi` sections into the file as well, strictly following `references/solution-format-spec.md`.

### Step 7 — Report

Report a summary to the user:
- Number of questions processed
- For each question: filename, type, difficulty, tags, number of variable sets
- Any issues encountered (unreadable text, missing images, unsolvable questions)

## CRITICAL: Core Principles

- **Tone & Persona (CRITICAL):** Target audience is Elementary (SD), Middle (SMP), and High School (SMA) students. Use a highly simplified, casual, friendly, and accessible tone—like a teacher explaining directly to a student. STRICTLY AVOID rigid academic jargon, hyper-formal language, or convoluted sentences (e.g., do NOT use "Transformasi Ekstraksi", "Ekuivalensi ordinat"). Use simple, everyday instructions (e.g., "Jadikan satu ruas", "Cari titik potongnya", "Masukkan nilainya"). **CRITICAL:** Do NOT use small talk or conversational greetings like "Halo adik-adik!", "Halo apa kabar", etc. Simple transitions like "Mari kita bahas" are acceptable, but generally prefer getting straight to the point. **CRITICAL:** Avoid overly infantile, dramatic, or bizarre analogies (e.g., do NOT say "masuk ke dalam perut fungsi" for composite functions, or "kurva tabrakan" for intersecting lines). Keep the language simple but mathematically sound (e.g., use "masukkan nilai g(x) ke dalam fungsi f", or "titik di mana kedua kurva bertemu/berpotongan").
- **Parameterize All Math:** Use `{{placeholder}}` inside LaTeX and prose; define derived intermediate steps and final answers in `variableFormulas.solutions` using bare mathjs syntax (no `{{}}`, no `Math.`).
- **No Option Letter References:** Never write "opsi D" or "jawaban A" (positions are randomized). Always state the value: `Jadi, jawaban yang benar adalah ${{answer}}$.`
- **Strict Format Compliance:** Refer to `references/solution-format-spec.md` for exact frontmatter schema and section header tags.
