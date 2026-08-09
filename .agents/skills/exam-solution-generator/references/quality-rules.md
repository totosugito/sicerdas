# Quality Rules for Solution Generation

## Bahasa Indonesia Requirements

- All output text (question content, options, solutions, and tags) must be written in **standard Bahasa Indonesia** following **EYD** (Ejaan yang Disempurnakan) rules.
- Use clear, straightforward language suitable for Indonesian school students.
- Avoid informal language, slang, or unnecessary English terms.

## Tone & Pedagogical Style

You **MUST** adopt a friendly, natural, and conversational teaching tone, as if a teacher is explaining to students in class:
- **Extract Key Terms & Implicit Information**: Always explain implicit meanings in the "Diketahui:" section. For instance, "berhenti" implies final velocity $v = 0$, and "dilepas" implies initial velocity $v_0 = 0$. Provide explicit explanatory notes for students.
- **Detailed Step-by-Step Explanation**: Do not just give brief mathematical commands (e.g., "Substitute..."). Explain the *reasoning* behind each step, especially in the "Konsep dan Rumus Dasar" section.
- **AVOID** stiff, purely instructional, or robotic phrasing.
- **Use smooth transitions** between steps (e.g., *"Nah, setelah rumusnya dapat, kita masukkan nilainya..."*).

## Solution Structure (MANDATORY)

Solutions are written for **school students**. They must be **complete, sequential, and easy to understand**.

### Mandatory Structure for Math/Physics Calculation Questions

```
Solution 1 (Cara Konseptual) — MANDATORY for ALL questions:
  **Diketahui:** (bold label)
  - Bullet list of known variables/values
  - MANDATORY: Extract implicit hidden variables (e.g., "dilepas" → v₀ = 0)
  - MANDATORY: Include standard assumptions (e.g., g = 10 m/s²)
  
  **Ditanya:** (bold label) + target variable/question
  
  **Konsep dan Rumus Dasar:** (bold label, standalone header)
  Paragraph: MANDATORY theory explanation in friendly tone BEFORE calculating
  
  **Langkah Penyelesaian:** (bold label, standalone header)
  
  > **Tip:** Short formula reminder (optional, concise callout)
  
  Numbered steps (1., 2., 3.) or single paragraph if only 1 step
  Each step with equation blocks as needed
  
  Final paragraph: "Jadi, jawaban yang benar adalah ${{answer}}$."

Solution 2 (Trik Cepat) — OPTIONAL:
  Only if a valid shortcut/trick exists. Omit for pure recall/definition questions.
  
  > **Tip:** Shortcut name/formula
  
  Paragraph: Explain how the shortcut applies BEFORE calculating
  
  Equation blocks with calculation
  
  Final paragraph: "Jadi, jawaban yang benar adalah ${{answer}}$."
```

### Step Formatting Rules

- **Single-step solution (ONLY 1 STEP):** Use a regular paragraph. Do NOT use `1.` numbered list — it looks awkward with only one item.
- **Multi-step solution (2+ STEPS):** Use numbered list `1.`, `2.`, `3.` for each step.
- **DO NOT** write words like "Langkah pertama", "Langkah 1", or "1." inside the text if already using numbered markdown list — the numbers render automatically.

### Bold Label Rules

- **ONLY** bold these labels: `**Diketahui:**`, `**Ditanya:**`, `**Konsep dan Rumus Dasar:**`, `**Langkah Penyelesaian:**`
- **NEVER** bold entire paragraphs
- Separate the bold label from the text content clearly

## Equation Formatting Rules (CRITICAL)

### Multi-line Equations & Intermediate Steps

For key formulas and calculations, ALWAYS format math into clear, vertical step-by-step blocks:

1. **MULTI-PHASE BREAKDOWN:** For problems requiring calculation of multiple sequential quantities (e.g., $C_s \rightarrow Q \rightarrow V_1$), NEVER merge all calculations into a single giant equation block. Split each logical phase into a **separate `$$` equation block** with a paragraph header between them (e.g., "Mencari kapasitas gabungan seri ($C_s$):").

2. **KEEP RECIPROCAL INVERSION IN SAME BLOCK:** For inverse fraction calculations (e.g., $\frac{1}{C_s} \rightarrow C_s$ or $\frac{1}{R_p} \rightarrow R_p$), NEVER split the final inverted variable into a separate standalone `$$` block. Keep it as the final line inside the same `\begin{aligned}` block using `\\[6pt] \implies C_s &= \dots`.

3. **SINGLE EQUAL SIGN PER LINE:** Each line inside a TeX equation MUST contain at most ONE `=` operator.

4. **NO HORIZONTAL EQUATION CHAINS:** NEVER write a horizontal equation chain on a single line (e.g., `Q = C_s \times V = \frac{18}{11} \times 220 = 18 \times 20 = 360 \text{ C}`). Every single step MUST get its own vertical line in the `aligned` block using `&=`.

5. **NO REPEATING LEFT-HAND VARIABLE:** The left-hand variable (e.g., `\frac{1}{C_s}` or `Q`) MUST appear **ONLY ONCE** on the first line. Subsequent lines MUST start directly with `&=` (e.g. `&= \frac{1}{3} + ...`).

6. **NO JUMPING TO FINAL RESULT:** You MUST write explicit intermediate arithmetic evaluation lines (e.g., formula → substitution → powers/products evaluation → intermediate sums → final value) and include intermediate variables in `variableFormulas.solutions` (e.g., `"r1_sq": "r1^2"`, `"term1": "m1 * r1_sq"`).

### Correct Equation Example

```latex
$$\begin{aligned} \frac{1}{C_s} &= \frac{1}{C_1} + \frac{1}{C_2} + \frac{1}{C_3} \\ &= \frac{1}{3} + \frac{1}{6} + \frac{1}{9} \\ &= \frac{6+3+2}{18} \\ &= \frac{11}{18} \\[6pt] \implies C_s &= \frac{18}{11} \text{ F} \end{aligned}$$
```

### Incorrect Equation Examples

```
❌ BAD (horizontal chain):
   Q = C_s × V = 18/11 × 220 = 18 × 20 = 360 C

❌ BAD (repeating LHS variable on line 2):
   \frac{1}{C_s} = \frac{1}{C_1} + \frac{1}{C_2}
   \frac{1}{C_s} = \frac{1}{3} + \frac{1}{6} = \frac{3}{6}

❌ BAD (jumping to final answer):
   I = m_1 r_1^2 + m_2 r_2^2 + m_3 r_3^2
   I = (2)(0.3)^2 + (3)(0.4)^2 + (1)(0.5)^2
   I = 0.91 kg⋅m²
   (Missing: intermediate powers/products evaluation lines)

❌ BAD (splitting reciprocal inversion into separate block):
   $$\frac{1}{C_s} = \frac{11}{18}$$
   $$C_s = \frac{18}{11}$$   ← Should be \\[6pt] \implies inside same block
```

### Use Inline LaTeX for Variable References

When referencing variables/values within explanatory text, use inline LaTeX:
```markdown
Substitusikan nilai $x = {{x}}$ ke dalam fungsi $f(x) = 3x + 7$:
```

## Dynamic Variables (Computational Questions)

For questions involving calculations or mathematical functions, you **MUST** parameterize the question:

1. **Convert Number Words to Digits**: If numbers are written as words in the question text (e.g., "Dua detik", "Tiga buah"), convert them to numeric digits ("2 detik", "3 buah") so they can be parameterized.

2. **Scan All Constants**: Replace hardcoded numbers with placeholders like `{{a}}`, `{{b}}`, `{{x}}`, etc.

3. **Parameterize Solution Steps & Conclusions (CRITICAL):** Do NOT hardcode evaluated numbers in solution text or equations. Use placeholders so solutions update dynamically across all variations:
   - ✅ `$3({{x}}) + 7 = {{answer}}$`
   - ❌ `$3(5) + 7 = 22$`

4. **Generate ≥5 Variable Sets**: Each set must satisfy all mathematical constraints (e.g., log domains, positive denominators, no division by zero).

5. **Include Distractor Options**: All `opt1`, `opt2`, etc. must be in the variables array.

6. **Define Intermediate Solutions**: In `variableFormulas.solutions`, define all intermediate calculation steps:
   - ✅ `"term1": "3 * x"`, `"answer": "3 * x + 7"`
   - ❌ `"answer": "22"` (hardcoded)

7. **Formula Syntax Rules:**
   - Use **bare variable names**: `"b * x_val - c"`
   - DO NOT use mustache braces: ~~`"{{b}} * {{x_val}}"`~~
   - DO NOT use `Math.` prefix: ~~`"Math.sqrt(x)"`~~
   - Use `mathjs` functions directly: `sqrt()`, `abs()`, `log()`, `pow()`, `sin()`, `cos()`

Set `variableFormulas: null` ONLY for pure conceptual/theoretical questions (e.g., "Siapa penemu gravitasi?").

## Options Rules

### Plausible Distractors

For `multiple_choice` and `multiple_select`, incorrect options **MUST be plausible**:
- Results derived from common student misconceptions (wrong sign, unit conversion errors)
- Results from almost-correct calculation steps
- **NOT** arbitrary or obviously random numbers

### Scoring Logic

| Type | maxScore | Correct options |
|------|----------|----------------|
| `multiple_choice` | `1` | Exactly 1 correct |
| `multiple_select` | Total correct | 2+ correct |
| `essay` | Defined by rubric | No options |
| `statement_reasoning` | `1` | Exactly 1 correct (Benar or Salah) |

### No Option Letter References (CRITICAL)

Since option positions are randomized in the database, NEVER reference option letters in solutions:
- ❌ "Jawaban yang benar adalah opsi D"
- ✅ "Jadi, jawaban yang benar adalah ${{answer}}$."

## Conclusion Sentence (MANDATORY)

The final paragraph of **ANY** solution (general or fast method) must ALWAYS be exactly:

```
Jadi, jawaban yang benar adalah ${{answer}}$.
```

Or for text answers:
```
Jadi, jawaban yang benar adalah **[hasil]**.
```

Never use weird phrasing like "jawaban cepatnya", "maka hasilnya", etc.

## Callout / Alert Rules

- Use `> **Tip:**` blockquotes for concise formula reminders
- DO NOT include emojis (💡, 🚀) — the UI renders icons automatically
- Keep callouts short — formula reminders, not long narrative explanations
- DO NOT put long explanations inside callouts

## Tags (Categorization)

- 1–3 tags per question in Bahasa Indonesia
- Use broad, general topic tags rather than specific question numbers
- Good examples: `"Trigonometri"`, `"Logaritma"`, `"Kinematika"`, `"Bangun Ruang"`
- Bad example: `"Soal Nomor 3 Halaman 45"`
- **CRITICAL:** If the markdown source contains a chapter/section header (e.g., `# BAB 7: GETARAN DAN GELOMBANG`), ALWAYS extract the chapter title (e.g., `"Getaran dan Gelombang"`) as the primary tag

## Image & Diagram Handling

When a question references an image (e.g., `![caption](image.jpg)`):

1. **CRITICAL — Inspect Diagram Information:** Always inspect the SVG or image file! Diagrams often contain essential numbers, angles, vector labels, or given values (e.g., $v_0 = 20\text{ m/s}$, $\theta = 45^\circ$) that are NOT written in the markdown text.
2. **Extract all diagram parameters** and include them in `**Diketahui:**` section and parameterize them in `variableFormulas`.
3. Keep the `![caption](file.png)` reference in the markdown — the converter will handle SVG embedding.

## Anti-Hallucination

1. If text/symbols are unreadable → write `[UNREADABLE]`.
2. If a question can be extracted but **cannot be solved with certainty** → still generate the solution markdown, but leave `## Pembahasan` sections empty and add a note: `[UNSOLVABLE: reason]`.
3. If a question is completely unintelligible → do NOT create a solution file. Report the issue instead.

## Clean Extraction

- Strip question numbers from source (`"1."`, `"Soal 5:"`, etc.)
- Maintain clean separation between text and math expressions
- Preserve any chapter/topic headers for tag extraction
