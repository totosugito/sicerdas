---
name: exam-question-extender
description: Generates new exam questions based on existing topic and questions in a folder. Reads existing single-question files, analyzes sub-topics and difficulty, and creates brand new single-question markdown files saved in the ori/ directory with prefix new_qXX.md. Use when asked to generate new questions, extend question bank, tambah soal, or expand existing questions for a topic.
---

# Exam Question Extender Skill

Generates new, high-quality exam questions in Markdown format by analyzing existing questions in a topic folder. It expands question banks while strictly maintaining topic relevance, mathematical accuracy, proper LaTeX formatting, and age-appropriate language.

## When to Use

- User asks to "generate new questions", "tambah soal", or "expand question bank" for a folder or topic
- A topic has too few questions (e.g., only 10 questions) and needs additional questions
- User wants to complement existing `ori/` questions with generated questions

## Output Location & Naming Convention

- **Output Directory:** Save directly inside the existing `ori/` subfolder of the input target folder (e.g., `test/024/ori/`).
- **File Naming:** Use `new_q01.md`, `new_q02.md`, `new_q03.md`, etc.
  - Example: `test/024/ori/new_q01.md`, `test/024/ori/new_q02.md`

## Workflow

### Step 1 — Read and Analyze Existing Questions

1. Read all existing `.md` files in the target folder's `ori/` subfolder.
2. Identify:
   - **Topic & Sub-topics:** Core concept (e.g., *Persamaan Kuadrat*, *Fungsi Kuadrat*, *Limit Fungsi Aljabar*).
   - **Common Problem Types:** Factoring, discriminant, roots calculation, word problems, vertex formula, etc.
   - **LaTeX & Formatting Style:** Standardized LaTeX delimiters (`$$...$$`), option format `(a)`, `(b)`, `(c)`, `(d)`, `(e)`.
   - **Header/Context:** Preserve any shared header or chapter context if present across original questions.

### Step 2 — Generate New Questions

1. Create original, mathematically sound questions on the same topic.
2. Vary parameter values, problem setups, and sub-topics to avoid repeating exact patterns.
3. Ensure every multiple-choice option `(a)` - `(e)` has one correct answer and plausible distractors based on common student errors.
4. Use simple, clear, and friendly Bahasa Indonesia tailored for school students.
5. Format LaTeX formulas strictly using `$$...$$` syntax.

### Step 3 — Save to `ori/` Directory

Save each newly generated question as an individual Markdown file in the target `ori/` folder:
- `ori/new_q01.md`
- `ori/new_q02.md`
- ...

### Step 4 — Update report.md & Output Summary

1. Read and update the `report.md` file in the main folder (e.g. `test/report.md`).
2. Update the report table format to include columns for original questions, newly generated questions, and total questions:
   `| No | Folder | Bab | Soal Ori | Soal Baru | Total Soal |`
3. Present a brief summary detailing:
   - Target folder processed
   - Number of new questions created (`new_q01.md` ... `new_qXX.md`)
   - Updated total question count for the topic in `report.md`

## File Structure Example

Each generated file (e.g., `ori/new_q01.md`) must follow clean single-question format:

```markdown
# BAB: PERSAMAAN KUADRAT

Akar-akar dari persamaan kuadrat $$x^2 - 5x + 6 = 0$$ adalah $$p$$ dan $$q$$. Nilai dari $$p + q$$ adalah ...

(a) 2
(b) 3
(c) 5
(d) 6
(e) 10
```

## CRITICAL Rules

```
❌ BAD:  Saving new questions outside the ori/ folder or with wrong prefix (e.g. 01_q11.md instead of new_q01.md)
✅ GOOD: Save directly in ori/ with prefix new_q01.md, new_q02.md, etc.

❌ BAD:  Generating questions off-topic or with incorrect mathematical calculations/answer keys
✅ GOOD: Verify mathematical correctness and distractor logic for every generated question

❌ BAD:  Using broken LaTeX formatting or single-dollar $...$ delimiters if project standard uses $$...$$
✅ GOOD: Keep LaTeX clean and compliant with $$...$$ format

❌ BAD:  Overwriting existing original files (01_q01.md, etc.)
✅ GOOD: Write only new files prefixed with new_qXX.md
```
