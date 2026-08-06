---
name: text-input-fixer
description: Fixes typos, broken characters, garbled text, and formatting issues in markdown input files (especially exam question files in Bahasa Indonesia). Use when asked to fix text, perbaiki teks, clean up markdown, fix typos, fix encoding, or normalize input before generating exam questions.
---

# Text Input Fixer Skill

Cleans up and normalizes raw markdown text files — fixing typos, garbled/broken characters, OCR artifacts, and formatting inconsistencies — so they are ready for downstream processing (e.g., by the `exam-question-generator` skill).

## When to Use

- User asks to "fix", "perbaiki", or "bersihkan" a text/markdown file
- User says the input has typos, broken characters, or encoding issues
- User provides a messy `.md` file and wants it cleaned up before generating questions
- User mentions OCR output that needs correction
- The `exam-question-generator` encounters garbled input and needs a pre-processing step

## Workflow

### Step 1 — Read References

Before processing, read these reference files:

1. `references/common-fixes.md` — Catalog of common issues and their fixes
2. `examples/before-after.md` — Concrete before/after examples

### Step 2 — Read and Analyze the Source File

1. Read the user's file using `view_file`.
2. Scan the entire document and identify all issues from the categories below.
3. Do NOT silently skip any issues — log every fix you make.

### Step 3 — Apply Fixes

Apply fixes in the following order. Each category is detailed in `references/common-fixes.md`.

#### 3.1 — Encoding & Character Fixes
- Replace mojibake / garbled Unicode (e.g., `â€"` → `—`, `â€™` → `'`, `Ã©` → `é`)
- Replace HTML entities (e.g., `&amp;` → `&`, `&lt;` → `<`, `&#8211;` → `–`)
- Normalize Unicode homoglyphs (e.g., fullwidth digits `１２３` → `123`, Cyrillic lookalikes → Latin)
- Remove invisible/zero-width characters (`\u200B`, `\u00AD`, `\uFEFF`, etc.)
- Normalize whitespace (non-breaking spaces `\u00A0` → regular spaces, tab → spaces)

#### 3.2 — OCR Artifact Fixes
- Common OCR misreads: `l` ↔ `1`, `O` ↔ `0`, `rn` → `m`, `cl` → `d`
- Fix broken words split across lines (hyphenated line breaks: `persa-\nmaan` → `persamaan`)
- Reconnect words broken by random spaces (`per samaan` → `persamaan`)

#### 3.3 — Bahasa Indonesia Typo & EYD Fixes
- Fix common Indonesian typos (see `references/common-fixes.md` for the full list)
- Fix capitalization: sentence starts, proper nouns, abbreviations
- Fix punctuation spacing: no space before `.` `,` `:` `;`, one space after
- Fix repeated punctuation (`...` is OK, `....` or `,,` is not)
- Smart quotes → straight quotes for consistency in markdown

#### 3.4 — LaTeX Fixes
- Fix broken LaTeX delimiters: unmatched `$`, missing closing `$`
- Normalize delimiter style: `\(` `\)` → `$ $`, `\[` `\]` → `$$ $$`
- Fix common LaTeX typos:
  - `\frac` without braces → `\frac{num}{den}`
  - `\sqr` → `\sqrt`
  - `\tmes` / `\tiems` → `\times`
  - `\aplha` → `\alpha`
  - Missing backslash on common commands (e.g., `sqrt` → `\sqrt`, `frac` → `\frac`)
- Fix spacing issues inside math: `$ x $` is OK, `$x$` is OK, but `$ x$` or `$x $` should be normalized
- Fix curly brace mismatches inside LaTeX expressions

#### 3.5 — Markdown Structure Fixes
- Normalize option markers: `a)`, `a.`, `A)`, `A.` → `(a)`, `(b)`, etc.
- Ensure blank line between question body and options
- Ensure blank line between consecutive questions
- Fix numbering: `1.`, `2.`, `3.` — fill gaps or fix duplicates
- Remove stray page numbers, headers/footers from scanned documents
- Remove excessive blank lines (more than 2 consecutive → 2)

#### 3.6 — Content Integrity Checks
- Flag (but do NOT auto-fix) ambiguous content with `[REVIEW: ...]` comments
- If a word is unrecognizable and context is insufficient, mark as `[UNREADABLE: original]`
- If a LaTeX expression is too broken to reconstruct, mark as `[BROKEN_LATEX: original]`

### Step 4 — Output

1. Write the cleaned file to the same path (overwrite original) OR to a new file if the user specifies.
2. Present a **fix report** summarizing:
   - Total number of fixes applied, grouped by category
   - Any `[REVIEW]`, `[UNREADABLE]`, or `[BROKEN_LATEX]` flags that need human attention
   - Line numbers where significant changes were made
3. If there are `[REVIEW]` flags, ask the user to verify before proceeding.

### Step 5 — (Optional) Chain to Exam Generator

If the user originally asked to generate exam questions AND the input needed fixing:
1. Fix the input first (this skill)
2. Show the fix report
3. Ask the user if they want to proceed with question generation
4. If yes, continue with the `exam-question-generator` skill workflow

## CRITICAL Rules

```
❌ BAD:  Silently changing mathematical content (e.g., fixing "2x + 3 = 7" to "2x + 3 = 8")
✅ GOOD: Only fix formatting/typos, never change mathematical meaning

❌ BAD:  Auto-correcting a word that might be a valid technical term
✅ GOOD: Flag it as [REVIEW: "simtot" — did you mean "simtom" or "asimtot"?]

❌ BAD:  Removing content that looks like garbage but might be intentional
✅ GOOD: Flag it as [UNREADABLE: original text] and let the user decide

❌ BAD:  Fixing LaTeX by guessing the formula
✅ GOOD: Flag as [BROKEN_LATEX: \frc{x{2}] and let the user fix the math
```
