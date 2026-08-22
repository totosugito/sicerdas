# Solution Markdown Format Specification

This document defines the intermediate format for enriched exam question files. It is the contract between the **exam-solution-generator** (which writes these files) and the **exam-blocknote-converter** (which reads them).

## File Structure

Each file represents **one question** and consists of two parts:

1. **YAML Frontmatter** — structured metadata (between `---` delimiters)
2. **Markdown Body** — question content, options, and solutions

## YAML Frontmatter Schema

```yaml
---
type: multiple_choice          # REQUIRED: multiple_choice | multiple_select | essay | statement_reasoning
difficulty: easy               # REQUIRED: easy | medium | hard
tags:                          # REQUIRED: 1-3 tags in Bahasa Indonesia
  - Matematika
  - Aljabar
maxScore: 1                    # REQUIRED: integer, default 1
scoringStrategy: all_or_nothing # REQUIRED: all_or_nothing | partial | partial_with_penalty
requiredTier: free             # OPTIONAL: free (default) | pro | enterprise
isActive: true                 # OPTIONAL: default true
variableFormulas:              # REQUIRED for math questions, null for pure conceptual
  variables:                   # At least 5 sets
    - { x: 5, opt1: 12, opt2: 15, opt3: 22, opt4: 35 }
    - { x: 3, opt1: 10, opt2: 13, opt3: 16, opt4: 21 }
    - { x: 8, opt1: 24, opt2: 28, opt3: 31, opt4: 40 }
    - { x: 10, opt1: 27, opt2: 32, opt3: 37, opt4: 45 }
    - { x: 4, opt1: 14, opt2: 17, opt3: 19, opt4: 25 }
  solutions:                   # Derived calculations (bare mathjs syntax)
    term1: "3 * x"
    answer: "3 * x + 7"
---
```

### Frontmatter Field Rules

| Field | Required | Rules |
|-------|----------|-------|
| `type` | ✅ | Has options → `multiple_choice` or `multiple_select`. No options → `essay`. Has Benar/Salah → `statement_reasoning`. |
| `difficulty` | ✅ | Recall/memorization → `easy`. Application → `medium`. Analysis/HOTS → `hard`. |
| `tags` | ✅ | 1–3 broad topic tags in Bahasa Indonesia. If source has chapter header (e.g., `# BAB 7: GETARAN DAN GELOMBANG`), extract chapter title as primary tag. |
| `maxScore` | ✅ | Default `1` for single-answer MC or SR. Sum of scores for `multiple_select`. Rubric total for `essay`. |
| `scoringStrategy` | ✅ | Default `all_or_nothing`. Use `partial` only for `multiple_select` or `essay`. |
| `requiredTier` | ⬜ | Default `free`. Use `pro` or `enterprise` if specified. |
| `isActive` | ⬜ | Default `true`. |
| `variableFormulas` | ✅ | `null` for pure conceptual questions. Object with `variables` (≥5 sets) and `solutions` for math questions. |

### variableFormulas Rules (CRITICAL)
 
 - **`variables`**: Array of ≥5 objects. Each object maps placeholder names to numeric or string values. Must include `opt1`, `opt2`, etc.
 - **`solutions`**: Object mapping derived variable names to **plain numeric math expressions with bare variable names**.
   - ✅ CORRECT (Pure Math): `"term1": "3 * x"`, `"answer": "3 * x + 7"`, `"r1_sq": "r1^2"`
   - ❌ WRONG: `"term1": "3 * {{x}}"` (no mustache braces in solution formulas!)
   - ❌ WRONG: `"answer": "Math.sqrt(x)"` (no `Math.` prefix! Use bare `sqrt(x)`)
   - ❌ **STRICTLY FORBIDDEN (Ternary / If-Else / String Concatenation):**
     - ❌ `"term": "m === -1 ? '-x' : 'x'"` (will fail in MathJS evaluation)
     - ❌ `"g_eq": "term + ' + ' + c"` (no string concatenation)
     - ❌ `"answer": "'1 dan 3 SAJA'"` (text answers should not be in `solutions`)
   - **How to handle string/formatting variations:** If a variable is a formatted string or text (e.g., equations like `"-x + 3"` or `"2x - 5"`), specify the pre-formatted string directly inside each object in `variables` (e.g. `variables: [{ m: -1, eq: "-x + 3" }]`).
 - Use built-in `mathjs` functions directly: `sqrt()`, `abs()`, `log()`, `pow()`, `sin()`, `cos()`, `tan()`, `pi`, `e`

## Markdown Body Sections

The body uses specific `##` headings to delimit sections. The converter recognizes these exact headings.

### `## Soal` — Question Content

Contains the question text with inline math (`$...$`) and display math (`$$...$$`).

```markdown
## Soal

Berapakah hasil dari $3x + 7$ jika $x = {{x}}$?
```

For questions with images:
```markdown
## Soal

Perhatikan gambar berikut!

![Diagram gaya](soal-01.png)

Tentukan resultan gaya pada benda tersebut.
```

### `## Opsi` — Answer Options

Only for `multiple_choice`, `multiple_select`, and `statement_reasoning`. Uses checkbox list:
- `- [ ]` for incorrect options
- `- [x]` for correct option(s)

```markdown
## Opsi

- [ ] ${{opt1}}$
- [ ] ${{opt2}}$
- [x] ${{opt3}}$
- [ ] ${{opt4}}$
```

For text-only options:
```markdown
## Opsi

- [x] Kecepatan benda meningkat
- [ ] Kecepatan benda menurun
- [ ] Benda diam
- [ ] Benda bergerak mundur
```

For `statement_reasoning`, always exactly 2 options:
```markdown
## Opsi

- [x] Benar
- [ ] Salah
```

### `## Alasan` — Reason Content (statement_reasoning only)

Only used when `type: statement_reasoning`. Contains the "SEBAB" (reason) part.

```markdown
## Alasan

Gaya gravitasi sebanding dengan massa benda dan berbanding terbalik dengan kuadrat jarak antara dua benda.
```

### `## Pembahasan: Cara Konseptual` — General Solution (MANDATORY)

The primary solution. Must follow the `Diketahui → Ditanya → Konsep → Langkah` structure.

```markdown
## Pembahasan: Cara Konseptual

**Diketahui:**
- Fungsi $f(x) = 3x + 7$
- Nilai $x = {{x}}$

**Ditanya:** Nilai dari $3x + 7$

**Konsep dan Rumus Dasar:**

Untuk menentukan nilai dari suatu fungsi aljabar linier, substitusikan nilai variabel yang diketahui secara langsung ke dalam aljabar fungsi tersebut.

**Langkah Penyelesaian:**

Substitusikan nilai $x = {{x}}$ ke dalam fungsi $3x + 7$:

$$\begin{aligned} f({{x}}) &= 3({{x}}) + 7 \\ &= {{term1}} + 7 \\ &= {{answer}} \end{aligned}$$

Jadi, jawaban yang benar adalah ${{answer}}$.
```

### `## Pembahasan: Trik Cepat` — Fast Method Solution (OPTIONAL)

Only include when a genuine calculation shortcut exists. Omit for pure conceptual/recall questions.

```markdown
## Pembahasan: Trik Cepat

> **Tip:** Substitusi langsung $x = {{x}}$

Perhitungan singkat tanpa menuliskan langkah umum panjang:

$$3({{x}}) + 7 = {{answer}}$$

Jadi, jawaban yang benar adalah ${{answer}}$.
```

## LaTeX Conventions

| Pattern in Markdown | Meaning |
|---------------------|---------|
| `$...$` | Inline math expression |
| `$$...$$` | Display / standalone math equation |
| `$$\begin{aligned}...\end{aligned}$$` | Multi-line aligned equation |

For detailed equation quality rules (single equal sign per line, no horizontal chains, no repeated LHS, keeping reciprocal inversion in same block, intermediate steps), see [quality-rules.md](file:///home/toto/Documents/sicerdas/.agents/skills/exam-solution-generator/references/quality-rules.md).

### TeX Aligned Equation Example
```latex
$$\begin{aligned} \frac{1}{C_s} &= \frac{1}{C_1} + \frac{1}{C_2} + \frac{1}{C_3} \\ &= \frac{1}{3} + \frac{1}{6} + \frac{1}{9} \\ &= \frac{6+3+2}{18} \\ &= \frac{11}{18} \\[6pt] \implies C_s &= \frac{18}{11} \text{ F} \end{aligned}$$
```

## Text Formatting Conventions

| Pattern in Markdown | Meaning |
|---------------------|---------|
| `**Bold Text:**` | Bold label (labels only) |
| `- list item` | Bullet list item |
| `1. step text` | Numbered step |
| `> **Tip:** text` | Tip callout box |
| `> **Info:** text` | Info callout box |
| `> **Peringatan:** text` | Warning callout box |
| `![caption](file.png)` | Image reference |

### Bold Labels — Only These Labels Should Be Bold

- `**Diketahui:**`
- `**Ditanya:**`
- `**Konsep dan Rumus Dasar:**`
- `**Langkah Penyelesaian:**`

Never bold entire paragraphs.

### Numbered Steps vs Single Paragraph

- **2+ solution steps:** Use `1.`, `2.`, `3.` numbered list
- **Only 1 step:** Use a regular paragraph (no `1.` prefix)

### Callout / Alert Rules

- DO NOT include emojis (💡, 🚀) — the UI renders icons automatically
- Keep callouts concise — short formula reminders, not long explanations
- Text and inline math go directly inside the blockquote
- Supported types via bold prefix: `**Tip:**`, `**Info:**`, `**Peringatan:**`, `**Sukses:**`

## Conclusion Sentence (MANDATORY)

Every solution section (`Cara Konseptual` and `Trik Cepat`) MUST end with exactly:

```
Jadi, jawaban yang benar adalah ${{answer}}$.
```

Or for text answers:
```
Jadi, jawaban yang benar adalah **[hasil]**.
```

Never use variations like "jawaban cepatnya", "maka hasilnya", etc.

## Parameterization in Text

Use `{{placeholder}}` syntax inside both LaTeX and plain text:

- **Inside LaTeX:** `$3({{x}}) + 7 = {{answer}}$`
- **Inside prose:** `Substitusikan nilai x = {{x}} ke dalam fungsi`
- **In options:** `${{opt1}}$`, `${{opt2}}$`, etc.

## Complete Example

```markdown
---
type: multiple_choice
difficulty: easy
tags:
  - Matematika
  - Aljabar
maxScore: 1
scoringStrategy: all_or_nothing
requiredTier: free
isActive: true
variableFormulas:
  variables:
    - { x: 5, opt1: 12, opt2: 15, opt3: 22, opt4: 35 }
    - { x: 3, opt1: 10, opt2: 13, opt3: 16, opt4: 21 }
    - { x: 8, opt1: 24, opt2: 28, opt3: 31, opt4: 40 }
    - { x: 10, opt1: 27, opt2: 32, opt3: 37, opt4: 45 }
    - { x: 4, opt1: 14, opt2: 17, opt3: 19, opt4: 25 }
  solutions:
    term1: "3 * x"
    answer: "3 * x + 7"
---

## Soal

Berapakah hasil dari $3x + 7$ jika $x = {{x}}$?

## Opsi

- [ ] ${{opt1}}$
- [ ] ${{opt2}}$
- [x] ${{opt3}}$
- [ ] ${{opt4}}$

## Pembahasan: Cara Konseptual

**Diketahui:**
- Fungsi $f(x) = 3x + 7$
- Nilai $x = {{x}}$

**Ditanya:** Nilai dari $3x + 7$

**Konsep dan Rumus Dasar:**

Untuk menentukan nilai dari suatu fungsi aljabar linier, substitusikan nilai variabel yang diketahui secara langsung ke dalam aljabar fungsi tersebut.

**Langkah Penyelesaian:**

Substitusikan nilai $x = {{x}}$ ke dalam fungsi $3x + 7$:

$$\begin{aligned} f({{x}}) &= 3({{x}}) + 7 \\ &= {{term1}} + 7 \\ &= {{answer}} \end{aligned}$$

Jadi, jawaban yang benar adalah ${{answer}}$.

## Pembahasan: Trik Cepat

> **Tip:** Substitusi langsung $x = {{x}}$

Perhitungan singkat tanpa menuliskan langkah umum panjang:

$$3({{x}}) + 7 = {{answer}}$$

Jadi, jawaban yang benar adalah ${{answer}}$.
```
