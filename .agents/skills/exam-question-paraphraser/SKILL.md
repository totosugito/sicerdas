---
name: exam-question-paraphraser
description: Paraphrases and creates narrative/context variations of exam questions while strictly preserving their mathematical, scientific, and logical core. Use when asked to rephrase questions, create question variations, swap subjects/objects, or generate alternate versions of exam markdown files.
---

# Exam Question Paraphraser Skill

Rephrases and generates semantic variations of exam questions in Markdown format. It alters subjects, objects, scenarios, and sentence structures while strictly preserving mathematical parameters, scientific formulas, question difficulty, and correct answer logic.

## When to Use

- User asks to "paraphrase", "rephrase", or "buat variasi" of exam questions
- User wants to change names, entities, or scenarios (e.g., "Ibu" $\rightarrow$ "Ayah", "apel" $\rightarrow$ "jeruk")
- User needs alternate versions of an exam question bank to prevent cheating or create practice sets
- Preparing varied input files before generating BlockNote JSON with `exam-question-generator`

## Workflow

### Step 1 — Read References

Before processing, read these reference files:
1. `references/paraphrase-rules.md` — Detailed rules for safe entity swapping, sentence restructuring, and math/scientific preservation
2. `examples/before-after.md` — Concrete before/after examples of paraphrased exam questions

### Step 2 — Read and Analyze Source File

1. Read the input Markdown file using `view_file`.
2. Identify the core components of each question:
   - **Fixed Core (DO NOT CHANGE LOGIC):** Mathematical numbers/equations, physical laws, chemical formulas, relationship logic, and target variable.
   - **Flexible Elements (SAFE TO PARAPHRASE):** Names/subjects ("Ibu" $\rightarrow$ "Ayah"), items/objects ("apel" $\rightarrow$ "jeruk"), locations/scenarios ("pasar" $\rightarrow$ "toko"), sentence voice (active $\leftrightarrow$ passive), and introductory narrative phrasing.

### Step 3 — Apply Paraphrasing Rules

1. **Entity & Scenario Swapping:** Replace names, items, and settings with appropriate, culturally familiar alternatives in Bahasa Indonesia.
2. **Sentence Restructuring:** Rephrase sentence structure (e.g., passive to active voice) without changing the question intent or target calculation.
3. **Option Synchronization:** Ensure all multiple-choice options (`(a)`, `(b)`, `(c)`, etc.) remain consistent with the new entities/units if applicable.
4. **Preserve LaTeX & Math Formulas:** Keep LaTeX math expressions (`$...$`, `$$...$$`) and numeric values intact unless explicitly asked to randomize numbers.

### Step 4 — Output

1. Write the paraphrased Markdown content to the target file specified by the user (or append `_varied.md` / overwrite as requested) using `write_to_file`.
2. Present a **Paraphrase Report** summarizing:
   - Total number of questions paraphrased
   - Summary of entity/scenario swaps applied (e.g., "Ibu" $\rightarrow$ "Ayah", "apel" $\rightarrow$ "jeruk")
   - Confirmation that mathematical formulas and answer keys remain valid

## CRITICAL Rules

```
❌ BAD:  Changing mathematical values or formulas (e.g. changing 3x + 2 to 5x - 1) unless explicitly requested
✅ GOOD: Keep math formulas identical while changing scenario text (e.g. "Ibu membeli 3 kg apel..." -> "Ayah membeli 3 kg jeruk...")

❌ BAD:  Altering scientific facts (e.g. changing acceleration of gravity or chemical element symbols)
✅ GOOD: Preserve scientific principles while rephrasing the problem narrative

❌ BAD:  Breaking Markdown formatting or LaTeX delimiters
✅ GOOD: Maintain clean Markdown formatting with (a), (b), (c) options and valid LaTeX syntax
```
