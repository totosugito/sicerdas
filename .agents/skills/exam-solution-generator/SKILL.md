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

| Field             |                                                                                                                                                                                                                                                                                          How to Decide |
| ----------------- | -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| `type`            |                                                                                                                                                                                   Has options → `multiple_choice` or `multiple_select`. No options → `essay`. Has Benar/Salah → `statement_reasoning`. |
| `difficulty`      |                                                                                                                                                                                                                          Recall/memorization → `easy`. Application → `medium`. Analysis/HOTS → `hard`. |
| `maxScore`        |                                                                                                                                                                                                 Default `1` for single-answer MC or SR. Sum of scores for `multiple_select`. Rubric total for `essay`. |
| `scoringStrategy` |                                                                                                                                                                                                                     Default `"all_or_nothing"`. Use `"partial"` only for `multiple_select` or `essay`. |
| `requiredTier`    |                                                                                                                                                                                                                                          Default `"free"`. Use `"pro"` or `"enterprise"` if specified. |
| `isActive`        |                                                                                                                                                                                                                                                                                        Default `true`. |
| `tags`            | 1–3 broad topic tags in Bahasa Indonesia. **CRITICAL:** If the markdown source contains a chapter/section header (e.g., `# BAB 7: GETARAN DAN GELOMBANG`), ALWAYS extract the chapter title (e.g., `"Getaran dan Gelombang"`) as the primary tag, alongside specific sub-topic tags (e.g., `"Pegas"`). |

### Step 4 — Generate Variable Parameterization

For math/calculation questions, you **MUST** parameterize:

1. **Scan all constants** in the question and replace with placeholders like `{{a}}`, `{{b}}`, `{{x}}`.
2. **Convert number words to digits** (e.g., "Dua detik" → "2 detik") so they can be parameterized.
3. **Generate at least 5 distinct variable sets** that satisfy all mathematical constraints (log domains, positive denominators, no division by zero).
4. **Include distractor options** (`opt1`, `opt2`, etc.) — make them plausible based on common student mistakes.
5. **Define intermediate calculations** in `variableFormulas.solutions` with bare mathjs expressions:
   - ✅ PURE NUMERICAL ONLY: `"term1": "3 * x"`, `"answer": "3 * x + 7"`, `"grad": "-a / b"`
   - ❌ **DILARANG KERAS LOGIKA TERNARY / IF-ELSE (BAIK DI YAML MAUPUN INLINE MARKDOWN):** Jangan pernah menulis logika ternary (`? :`), perbandingan (`===`, `==`, `>`, `<`), pemanggilan fungsi (seperti `abs()`), atau penggabungan string (`+ '' +`) di dalam blok `solutions` YAML **MAUPUN** secara inline/langsung di dalam teks Markdown/LaTeX!
     - ❌ INLINE MARKDOWN SALAH: `y = {{a == 1 ? '' : a}}x^2 {{b > 0 ? '+' : '-'}} {{abs(b)}}x` (Templating engine tidak mendukung if-else / abs!)
     - ❌ YAML SOLUTIONS SALAH: `"g_x_term": "m === -1 ? '-x' : ..."` (MathJS AKAN ERROR!)
     - ❌ YAML SOLUTIONS SALAH: `"answer": "'1 dan 3 SAJA yang benar'"` (MathJS BUKAN untuk string jawaban teks!)
   - **SOLUSI FORMAT TEKS / PERSAMAAN (CRITICAL):** Jika Anda perlu mengatur format persamaan matematika (misal: menghilangkan angka 1 di depan `x`, mengatur tanda plus/minus `+ 3` vs `- 3`), Anda **WAJIB** membuat satu property utuh berisi string persamaan final tersebut **langsung di dalam array `variables`** untuk tiap variasi (contoh: `{ a: 1, b: -3, eq_str: "x^2 - 3x" }`). Lalu di teks Markdown cukup panggil murni labelnya: `y = {{eq_str}}`. Jangan merakit string ini dengan memecah koefisien plus/minus di dalam template!

Set `variableFormulas: null` untuk soal yang murni konseptual/teori atau soal pilihan ganda teks statis (seperti tipe soal '1, 2, 3 benar').

### Step 5 — Generate Solutions

Write complete pedagogical solutions following the rules in `references/quality-rules.md`:

#### Solution 1: `## Pembahasan: Cara Konseptual` (MANDATORY)

**Image Placement Rule (CRITICAL):**

- **Original OCR Diagrams:** The original image MUST ONLY be placed inside the `## Soal` section (maintaining its exact position relative to the question text). **DO NOT** duplicate or embed the original raw OCR image again inside the `## Pembahasan` section! It is highly redundant since the user already sees it in the question block.
- **Auto-Illustrations:** If (and ONLY if) it's a _newly generated_ illustration specifically for the solution, embed it where it fits best logically inside `## Pembahasan` (e.g., inside `**Konsep Singkat:**` or the start of `**Langkah Penyelesaian:**`), followed immediately by the text explaining it.
- NEVER dump any images at the very bottom of the solution without context.

Must follow this student-first pedagogical structure (designed for students who are still learning, NEVER assuming all students are already advanced):

1. **`**Diketahui:**`** (bold label) followed by bullet list
   - List all known variables/functions **as stated in the problem** (do NOT perform early arithmetic conversions inside `Diketahui`, e.g., write `- Nilai $x = {{b}}^{-1}$`, and leave the conversion $x = \frac{1}{{{b}}}$ for Step 1).
   - **CRITICAL:** Extract implicit hidden variables from word problems (e.g., "dilepas" = $v_0 = 0$, "berhenti" = $v = 0$) and include standard assumptions (e.g., $g = 10$ m/s²).

2. **`**Ditanya:**`** (bold label) + target variable/question

3. **`**Konsep dan Rumus Dasar:**`** (bold label, standalone paragraph)
   - **MANDATORY:** Explain the core concept using very simple, clear, and well-structured language suitable for learning students BEFORE calculating.
   - If multiple properties/formulas are used (e.g., negative exponent + logarithm power rule + identity $\log_a a = 1$), format them as a **numbered list (`1.`, `2.`, `3.`)** so the student can digest each rule cleanly instead of reading a dense wall of text.
   - Always explain _why_ a rule works at a fundamental level (e.g., show that $\log_a(a^p) = p \cdot \log_a a$ and $\log_a a = 1$, rather than jumping straight to $\log_a(a^p) = p$).

4. **`**Langkah Penyelesaian:**`** (bold label, standalone paragraph)
   - Optional: `> **Tip:**` callout with concise universal formula reminder (no emojis, no `{{...}}` placeholders!)
   - Multi-step solution (2+ langkah): Wajib gunakan format Heading 3 `### 🔹 Langkah 1: [Judul Langkah]`, `### 🔹 Langkah 2: [Judul Langkah]`, dst. (jangan gunakan teks bold datar `**Langkah 1: ...**`).
   - Single step: Gunakan paragraf biasa tanpa heading langkah.
   - **Concrete Inside-Out Progression (CRITICAL for Learning Students):**
     - Solve from the **innermost / most concrete value outward** so the student works with concrete numbers rather than carrying abstract nested function symbols. For example, given $x = b^{-1}$, $g(x) = kx$, and $f(x) = a^{g(x)}$ to find $\log_a f(x)$:
       - **Langkah 1:** Evaluate $x$ into a fraction and substitute it into $g(x)$ to get a concrete number.
       - **Langkah 2:** Substitute that concrete number into $f(x) = a^{g(x)}$.
       - **Langkah 3:** Substitute $f(x)$ into $\log_a f(x)$ and apply fundamental properties step-by-step ($\log_a(a^p) = p \cdot \log_a a = p \cdot 1 = p$).
     - This ensures **`Cara Konseptual`** teaches the full foundational progression from the inside out, making it genuinely distinct from **`Trik Cepat`** (which simplifications from the outside in).
   - **One Small Visual Change per Line & Split Sub-Calculations:**
     - Inside every `$$\begin{aligned} ... \end{aligned}$$` block, each line must change only **ONE small visual element** from the line above it.
     - If a step contains two sub-calculations (e.g., first converting $x = b^{-1} = \frac{1}{b}$, then substituting into $g(x)$), split them into **two short equation blocks** separated by a friendly transition sentence.
     - The final equation block of the final step **MUST explicitly evaluate the target expression asked in `**Ditanya:**`** (never stop at an intermediate variable like $g(x) = 1$ when the question asks for $\log_a f(x)$).

5. **Conclusion:** Contextual sentence answering `**Ditanya:**`, e.g., `Jadi, nilai dari $\log_{{{a}}} f(x)$ adalah **${{answer}}$**.`

#### Solution 2: `## Pembahasan: Trik Cepat` (OPTIONAL)

Include ONLY when a genuine, universal calculation shortcut or alternative exam strategy exists (e.g., testing $x = 0$ to isolate the constant term, direct block substitution $u = g(x)$ without finding the explicit function formula, derivative tangent slope $f'(x) = m$, or constant shift formula $C_{\text{baru}} = C - Ah - Bk$).

**CRITICAL RULES FOR `Trik Cepat` & `> **Tip:**` CALLOUTS (STUDENT-FIRST PEDAGOGY):**

1. **Universal & Simple Formulas Only (NO `{{...}}` Placeholders & NO Overloaded Formulas in `> **Tip:**`):** Every `> **Tip:**` callout (both in Cara Konseptual and Trik Cepat) MUST state a **clean, memorable mathematical identity or universal shortcut rule** using simple symbols. **STRICTLY FORBIDDEN** to put problem-specific numbers or `{{placeholder}}` variables inside `> **Tip:**`, and **DO NOT** cram 4–5 abstract variables into a single convoluted conditional sentence in `> **Tip:**` (e.g., avoid `Jika f(x) = a^{kx} dan x = b^{-1}, maka ...` — instead write `> **Tip:** Sifat dasar logaritma: $\log_{a} \left(a^{p}\right) = p$ dan $b^{-1} = \frac{1}{b}$`).
2. **Design for Students Who Are Still Learning (No Mental Leaps / Single Visual Transition per Line):**
   - Never assume the student is already an expert. "Trik Cepat" means a **direct way of seeing through the problem (e.g., spotting that a huge number like $2020$ doesn't need to be calculated)**—it does **NOT** mean skipping intermediate algebraic lines inside the equation block!
   - Every line in `$$\begin{aligned} ... \end{aligned}$$` MUST change only **ONE small visual element** from the line above it (e.g., show $\log_{a} f(x) \rightarrow \log_{a}(a^{g(x)}) \rightarrow g(x) \rightarrow kx$, and show $k \cdot b^{-1} \rightarrow k \cdot \frac{1}{b} \rightarrow \frac{k}{b}$, never jump straight from $\log_{a} f(x)$ to $k \cdot \frac{1}{b}$!).
   - Split distinct mental phases (e.g., Phase 1: simplifying the expression; Phase 2: plugging in the number) into **two short equation blocks** separated by a friendly one-sentence transition so the student is never overwhelmed.
3. **Reference Gold-Standard Example for `Trik Cepat`:**
   ```markdown
   ## Pembahasan: Trik Cepat

   > **Tip:** Sifat dasar logaritma: $\log_{a} \left(a^{p}\right) = p$ dan $b^{-1} = \frac{1}{b}$

   Angka ${{a}}$ yang besar pada soal ini sebenarnya tidak perlu dihitung. Karena basis logaritma dan bilangan pokok perpangkatan pada $f(x) = {{a}}^{g(x)}$ sudah sama-sama ${{a}}$, maka nilai $\log_{{{a}}} f(x)$ langsung sama dengan pangkatnya saja, yaitu $g(x)$:

   $$\begin{aligned} \log_{{{a}}} f(x) &= \log_{{{a}}} \left({{a}}^{g(x)}\right) \\ &= g(x) \\ &= {{k}}x \end{aligned}$$

   Selanjutnya, tinggal masukkan nilai $x = {{b}}^{-1}$ (ingat bahwa pangkat $-1$ artinya pecahan $\frac{1}{{{b}}}$):

   $$\begin{aligned} \log_{{{a}}} f(x) &= {{k}} \cdot {{b}}^{-1} \\ &= {{k}} \cdot \frac{1}{{{b}}} \\ &= \frac{{{k}}}{{{b}}} \\ &= {{answer}} \end{aligned}$$

   Jadi, nilai dari $\log_{{{a}}} f(x)$ adalah **${{answer}}$**.
   ```

Structure:

1. `> **Tip:**` callout with universal formula/shortcut equation (no `{{...}}` placeholders!)
2. Paragraph explaining how the general shortcut applies to the given problem values
3. Equation block with calculation (starting with base formula before substitution)
4. Conclusion: `Jadi, jawaban yang benar adalah ${{answer}}$.`

Omit `Trik Cepat` ONLY for pure conceptual, definition, or direct recall questions where no shortcut applies.

#### Equation & Solution Quality Rules

See `references/quality-rules.md` for full rules on:

- Multi-phase breakdown (`$$` block per phase)
- **Write base formula/function before substitution:** Write the general form $g(x) = \dots$ before substituting numerical values $g(0) = \dots$ to keep the calculation flow clear for students.
- Reciprocal inversion inside the same `\begin{aligned}` block
- Vertical TeX equation layout (single `=` per line, `&=` per line, no horizontal chains, LHS variable on line 1 only)
- **No inline annotations with `\quad` / `\qquad`:** Keep `$$ ... $$` blocks purely mathematical without horizontal notes like `\quad \text{(masukkan x = ...)}`. Write explanations in Markdown narrative before/after the block.
- **Anti-Laziness / No Equation Ellipsis:** Strictly forbid writing `x^2... = 0` or lazy shortcuts. All terms and calculations must be written out completely.
- Intermediate calculation steps & parameterization using `{{placeholder}}` syntax. **CRITICAL LATEX RULE:** If a placeholder is used inside a subscript or superscript, you MUST wrap the placeholder in extra LaTeX curly braces: `_{{{placeholder}}}` or `^{{{placeholder}}}` (e.g., `\log_{{{a}}}`, NOT `\log_{{a}}`). Otherwise, multi-digit numbers will render brokenly (e.g. `\log_2020`).
- Statement Reasoning (`Pernyataan SEBAB Alasan`) handling

### Step 6 — Write Output File

1. Write the enriched markdown to the `solution/` subfolder of the target directory.
2. Use the same filename as the source (e.g., `ori/q01.md` → `solution/q01.md`).
3. **CRITICAL:** The output file MUST contain the complete question structure, NOT just the `## Pembahasan`. You MUST write the parameterized `## Soal` and `## Opsi` sections into the file as well, strictly following `references/solution-format-spec.md`.

### Step 7 — Run Validator & Sanitizer (CRITICAL)

After writing the solution markdown files, you **MUST** run the validation and auto-sanitization script:

```bash
python3 .agents/skills/exam-solution-generator/scripts/validate_solution_markdown.py <target_directory>/solution --fix
```

This script will automatically:

- Fix any horizontal equation chains (`a = b = c = ...`) into vertical `\begin{aligned}` blocks with `&=`.
- Ensure LaTeX subscript/superscript placeholders are cleanly braced (`_{{{var}}}`).
- Verify YAML frontmatter syntax, question types, and MathJS solutions format.
- Report any remaining syntax or structural errors so you can fix them immediately before finishing.

### Step 8 — Report

Report a summary to the user:

- Number of questions processed
- For each question: filename, type, difficulty, tags, number of variable sets
- Any issues encountered (unreadable text, missing images, unsolvable questions)

## CRITICAL: Core Principles

- **Tone & Persona (CRITICAL):** Target audience is Elementary (SD), Middle (SMP), and High School (SMA) students. Use a highly simplified, casual, friendly, and accessible tone—like a teacher explaining directly to a student. STRICTLY AVOID rigid academic jargon, hyper-formal language, or convoluted sentences (e.g., do NOT use "Transformasi Ekstraksi", "Ekuivalensi ordinat"). **CRITICAL:** Do NOT use small talk or conversational greetings like "Halo adik-adik!", "Halo apa kabar", etc. Simple transitions like "Mari kita bahas" are acceptable, but generally prefer getting straight to the point.
- **Mathematical Precision vs Non-Mathematical Slang/Shortcuts (CRITICAL):** While keeping the tone simple and friendly, you MUST use **mathematically accurate terminology** and **STRICTLY FORBIDDEN** to use non-mathematical, mechanical, or infantile expressions:
  - ❌ **DILARANG (Tidak Matematis / Mekanis):** _"angka 3 langsung habis dicoret"_, _"dicoret"_, _"keduanya saling menghilangkan"_, _"masuk ke dalam perut fungsi"_, _"kurva tabrakan"_, _"menembus dinding parabola"_, _"garis meleset"_.
  - ✅ **WAJIB (Sederhana namun Tepat Secara Matematis):**
    - Gunakan _"faktor $p$ pada pembilang dan penyebut saling membagi habis ($\frac{p}{p} = 1$)"_ atau _"disederhanakan dengan membagi pembilang dan penyebut dengan $p$"_ (BUKAN _"angka $p$ habis dicoret"_).
    - Gunakan _"berdasarkan sifat logaritma $\log\_{a}(a^{p}) = p$, nilainya sama dengan pangkatnya"_ (BUKAN _"basisnya saling menghilangkan/dicoret"_).
    - Gunakan _"masukkan/substitusikan fungsi $g(x)$ ke dalam fungsi $f$"_ (BUKAN _"masuk ke perut fungsi"_).
    - Gunakan _"titik di mana kedua kurva berpotongan"_ atau _"daerah dalam parabola ($y > x^{2}$)"_ (BUKAN _"kurva tabrakan"_ atau _"menembus dinding cekungan"_).
- **Parameterize All Math:** Use `{{placeholder}}` inside LaTeX and prose; define derived intermediate steps and final answers in `variableFormulas.solutions` using bare mathjs syntax (no `{{}}`, no `Math.`).
- **Contextual Conclusion & No Option Letters:** Never write "opsi D" or "jawaban A" (positions are randomized). Selalu buat kalimat penutup yang kontekstual langsung menjawab apa yang ditanyakan (contoh: `Jadi, nilai dari $\log_{{{a_val}}} f(x)$ adalah **${{kunci}}$**.`, atau `Jadi, jumlah buah milik adik adalah **${{kunci}}$ buah**.`), dan pastikan placeholder yang dipanggil SAMA PERSIS dengan variabel di opsi benar `- [x] {{kunci}}`.
- **No Raw HTML Elements (CRITICAL):** DILARANG KERAS menyisakan tag HTML seperti `<table>`, `<tr>`, `<td>`, `<th>`, `<div>` di `## Soal` atau `## Pembahasan`. Jika ada tabel kuantitas $P$ dan $Q$ pada soal mentah/input, konversi menjadi format daftar berbutir (bullet list): `- **Kuantitas P:** ...` dan `- **Kuantitas Q:** ...` atau tabel GFM Markdown.
- **Strict Format Compliance:** Refer to `references/solution-format-spec.md` for exact frontmatter schema and section header tags.
