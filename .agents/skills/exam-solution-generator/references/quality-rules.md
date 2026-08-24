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

2. **KEEP RECIPROCAL INVERSION IN SAME BLOCK:** For inverse fraction calculations (e.g., $\frac{1}{C_s} \rightarrow C_s$ or $\frac{1}{R_p} \rightarrow R_p$), NEVER split the final inverted variable into a separate standalone `$$` block. Keep it as the final line inside the same `\begin{aligned}` block using `\implies C_s &= \dots`.

3. **SINGLE EQUAL SIGN PER LINE:** Each line inside a TeX equation MUST contain at most ONE `=` operator.

4. **NO HORIZONTAL EQUATION CHAINS:** NEVER write a horizontal equation chain on a single line (e.g., `Q = C_s \times V = \frac{18}{11} \times 220 = 18 \times 20 = 360 \text{ C}`). Every single step MUST get its own vertical line in the `aligned` block using `&=`.

5. **NO REPEATING LEFT-HAND VARIABLE:** The left-hand variable (e.g., `\frac{1}{C_s}` or `Q`) MUST appear **ONLY ONCE** on the first line. Subsequent lines MUST start directly with `&=` (e.g. `&= \frac{1}{3} + ...`).

6. **NO JUMPING TO FINAL RESULT:** You MUST write explicit intermediate arithmetic evaluation lines (e.g., formula → substitution → powers/products evaluation → intermediate sums → final value) and include intermediate variables in `variableFormulas.solutions` (e.g., `"r1_sq": "r1^2"`, `"term1": "m1 * r1_sq"`).

7. **NO NESTED OR DUPLICATED ALIGNED BLOCKS (CRITICAL):** NEVER nest `\begin{aligned}` inside another `\begin{aligned}`. NEVER output duplicate tags like `$$\begin{aligned} \begin{aligned}` or `\end{aligned} \end{aligned}$$`. Use exactly ONE `\begin{aligned}` and ONE `\end{aligned}` inside each `$$ ... $$` block.

8. **DO NOT BREAK SINGLE DERIVATIONS INTO MULTIPLE `$$` BLOCKS:** A continuous vertical derivation (e.g., solving for x) MUST be placed inside a **SINGLE** `$$ \begin{aligned} ... \end{aligned} $$` block using `\\` for newlines. NEVER wrap every single line of the derivation into its own separate `$$` block!

### Correct Equation Example

```latex
$$\begin{aligned} \frac{1}{C_s} &= \frac{1}{C_1} + \frac{1}{C_2} + \frac{1}{C_3} \\ &= \frac{1}{3} + \frac{1}{6} + \frac{1}{9} \\ &= \frac{6+3+2}{18} \\ &= \frac{11}{18} \\ \implies C_s &= \frac{18}{11} \text{ F} \end{aligned}$$
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
   $$C_s = \frac{18}{11}$$   ← Should be \implies inside same block
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
   - ❌ **DILARANG MENULIS OPERASI MATEMATIKA DI DALAM PLACEHOLDER:** `{{d * p}}`, `{{d * p - e}}`, `{{a + b}}`. Engine templating HANYA membaca nama variabel murni. Semua langkah perantara wajib didefinisikan di `variableFormulas.solutions` (misal: `d_p: "d * p"`), lalu dipanggil sebagai `{{d_p}}`.

4. **Generate ≥5 Variable Sets (CRITICAL CONSTRAINT - AVOID REPEATING/NON-TERMINATING DECIMALS):**
   - Each set must satisfy all mathematical constraints (e.g., log domains, positive denominators, no division by zero).
   - **Pencegahan Koma Desimal Tak Berhingga (e.g., `2.666666666667`):** Saat mendesain variasi angka untuk operasi pembagian / pecahan (seperti $\frac{c_{num}}{c_{den}} \cdot x$), nilai variabel **WAJIB saling membagi habis (*divisible*)** atau menghasilkan bilangan bulat / desimal berhingga rapi. Contoh: jika $c_{den} = 3$, maka variabel pengali $x$ harus merupakan kelipatan dari $3$ ($3, 6, 9, \dots$), BUKAN bilangan sembarang seperti $4$ yang menghasilkan `2.6666...`.
   - **Pecahan Simbolik di LaTeX:** Jika soal menginginkan hasil dalam bentuk pecahan $\frac{a}{b}$, jangan biarkan MathJS membaginya menjadi floating number desimal. Definisikan pembilang (`num`) dan penyebut (`den`) secara terpisah di YAML, lalu render sebagai `\frac{{{num}}}{{{den}}}` di Markdown.

5. **Include Distractor Options**: All `opt1`, `opt2`, etc. must be in the variables array.

6. **Define Intermediate Solutions**: In `variableFormulas.solutions`, define all intermediate calculation steps:
   - ✅ `"term1": "3 * x"`, `"answer": "3 * x + 7"`
   - ❌ `"answer": "22"` (hardcoded)

7. **Formula Syntax Rules:**
   - Use **bare variable names**: `"b * x_val - c"`
   - DO NOT use mustache braces: ~~`"{{b}} * {{x_val}}"`~~
   - DO NOT use `Math.` prefix: ~~`"Math.sqrt(x)"`~~
   - Use `mathjs` functions directly: `sqrt()`, `abs()`, `log()`, `pow()`, `sin()`, `cos()`

8. **LaTeX Subscript / Superscript Compound Bracing:**
   - Selalu bungkus basis logaritma majemuk atau eksponen dengan kurung kurawal ganda dalam LaTeX agar tidak terpecah oleh parser: `\log_{ { {{base}}^{{{a_pow}}} } }` atau `\log_{ {{a_val}} }`, dan `_{{{placeholder}}}` / `^{{{placeholder}}}` untuk placeholder variabel.

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
- ❌ "Maka pilihan yang tepat adalah C"
- ✅ "Jadi, nilai dari $\log_{{{a_val}}} f(x)$ adalah **${{answer}}$**."

## Conclusion Sentence (MANDATORY & CONTEXTUAL)

Kalimat penutup pembahasan **WAJIB bersifat kontekstual** (merujuk langsung pada apa yang ditanyakan di bagian `**Ditanya:**` / konteks soal), BUKAN template kalimat kaku yang selalu sama di setiap soal.

### Pola Baku:
```markdown
Jadi, [apa yang ditanyakan / konteks soal] adalah **${{kunci}}** [satuan jika ada].
```

### Contoh Penerapan:
- **Soal Aljabar / Nilai Fungsi:**
  - `**Ditanya:**` Nilai dari $\log_{{{a_val}}} f(x)$
  - ✅ `Jadi, nilai dari $\log_{{{a_val}}} f(x)$ adalah **${{answer}}$**.`
- **Soal Cerita / Hitungan Objek:**
  - `**Ditanya:**` Jumlah buah milik adik sekarang
  - ✅ `Jadi, jumlah buah yang dimiliki adik sekarang adalah **${{answer}}$ buah**.`
- **Soal Fisika / Kimia:**
  - `**Ditanya:**` Kecepatan akhir balok ($v_t$)
  - ✅ `Jadi, kecepatan akhir balok tersebut adalah **${{v_t}}$ m/s**.`
- **Soal Teori / Teks Murni:**
  - ✅ `Jadi, organ yang berfungsi menyaring darah dalam tubuh adalah **{{answer}}**.`

### Aturan Wajib:
1. **Dilarang menyebut huruf opsi** (`opsi A`, `pilihan B`).
2. **Wajib sinkron dengan variabel opsi benar:** Placeholder yang ditebalkan (`**${{kunci}}$**`) HARUS persis sama dengan placeholder di baris `- [x] ${{kunci}}`.
3. Hindari kalimat penutup ambigu atau tidak tuntas seperti *"maka hasilnya adalah..."* atau *"jawaban cepatnya adalah..."*.

## Callout / Alert Rules

- `> **Tip:**` callouts MUST contain a concrete formula, key mathematical identity, or specific shortcut equation (e.g., `> **Tip:** (\sqrt{x})^y = x^{y/2}`).
- NEVER use generic procedural phrases like *"Memangkatkan kedua ruas secara langsung"*, *"Substitusi nilai"*, or *"Gunakan rumus"*.
- If no distinct formula shortcut exists, OMIT the `> **Tip:**` blockquote entirely and start directly with narrative text.
- DO NOT include emojis (💡, 🚀) — the UI renders icons automatically.
- Keep callouts concise — short formula/identity reminders, not long narrative explanations.
- DO NOT put long explanations inside callouts.

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
