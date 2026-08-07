---
name: markdown-question-splitter
description: Splits a single markdown file containing multiple exam questions into individual single-question markdown files. Use before calling exam-question-generator on long multi-question source files.
---

# Markdown Question Splitter Skill

Reads a source `.md` file containing multiple exam questions, cleans the input text, detects question boundaries, and extracts each question into an independent, standalone file to ensure accurate downstream processing by LLMs.

## When to Use

- User asks to "split questions from markdown file"
- User asks to "break multi-question file into single files"
- Pre-processing large exam files before running `exam-question-generator`

## Workflow

### Step 0 — Pre-process: Clean Raw Input Text (text-input-fixer)

Before analyzing and splitting questions, clean up the source `.md` file using rules from the `text-input-fixer` skill:
1. Read the `text-input-fixer` skill instructions: `../text-input-fixer/SKILL.md` and reference file `common-fixes.md`.
2. Apply all necessary text fixes (encoding/mojibake repair, Indonesian typo/EYD corrections, OCR artifact fixes, numbering/option formatting, and LaTeX syntax fixes).
3. Perform all text fixes **in-memory** or prepare the cleaned text before proceeding to Step 1 to guarantee precise question boundary detection.

### Step 1 — Input Analysis

1. Read the source `.md` file provided by the user using `view_file` (using the cleaned text from Step 0).
2. Identify the file structure and boundaries. Question boundaries are typically marked by:
   - Standard numbering (e.g., `1. `, `2. `) at the beginning of a line.
   - Question text followed by option blocks (e.g., `(A)`, `(B)`, `(C)`, `(D)`, `(E)`).
   - Markers such as "Soal No. X".

### Step 2 — Extraction

1. Carefully split the text based on the identified question boundaries.
2. Ensure EACH extracted standalone question includes:
   - The complete question text.
   - All answer options (if applicable).
   - Accompanying image references (e.g., `![image](img.jpg)`) or tables.
3. **CRITICAL — Shared Reading Context / Passage:** If the source file contains a shared reading passage or narrative block (e.g., *"For questions 1–3, read the following passage..."*), you **MUST** copy and prepend this shared passage text to the top of EACH corresponding question file (e.g., Q1, Q2, and Q3). Never allow a question to lose its primary reference context.
4. **CRITICAL — Relative Image Path Update:** Because output files are stored inside a `ori/` subfolder (one level deeper than the source file), all relative image paths inside the markdown **MUST** be updated by prepending `../`.
   - **Example:** `imgs/img_chart.jpg` → `../imgs/img_chart.jpg`
   - **Example:** `![diagram](gambar.png)` → `![diagram](../gambar.png)`
   - **Example:** `<img src="imgs/fig1.jpg" ...>` → `<img src="../imgs/fig1.jpg" ...>`
   - **DO NOT** modify absolute paths (starting with `/` or `http`).

### Step 3 — Automated Storage (Output Location)

1. Save all extracted question files into a central folder named `ori/` located in the same directory as the source file. (Do not create nested subfolders for individual questions).
   - **Example:** If source file is `/home/toto/Documents/sicerdas/test/page_01.md`, output files must be saved in `/home/toto/Documents/sicerdas/test/ori/`.
2. Save each extracted question using `write_to_file`.
   - **File Naming Convention:** Extract the numeric identifier from the source file name (e.g., `page_01.md` -> `01`), then combine with the sequential question number: `<ID_file>_q<no_soal>.md`.
   - **Example:** For input `page_01.md`, extracted files should be named `01_q01.md`, `01_q02.md`, `01_q03.md`, etc. If the source filename lacks a number (e.g., `soal.md`), use `soal_q01.md`.

### Step 4 — Report

1. After all files are saved, present a concise report.
2. The report must include:
   - Path to the `ori/` output directory where split files are saved.
   - Total number of questions successfully extracted.
   - Next step recommendation (remind user to process files in the `ori/` folder using `exam-question-generator`).

## Safety Guidelines

- **NEVER** modify (edit/overwrite) or delete the original source `.md` file.
- If question numbering in the source text is inconsistent or missing, strip the original number prefix in the extracted content—the filename `q04.md` preserves ordering.
