---
name: exam-blocknote-converter
description: Converts enriched solution markdown files (from solution/ folder) into strictly valid BlockNote JSON for the sicerdas exam system. Use when asked to convert solutions to JSON, build BlockNote JSON, generate exam files, or convert solution markdown to exam format.
---

# Exam BlockNote Converter Skill

Converts enriched solution markdown files from the `solution/` folder into strictly valid BlockNote JSON for the sicerdas exam engine. Writes output to the `exam/` folder.

## When to Use

- User asks to "convert solutions to JSON"
- User asks to "build BlockNote JSON from solution files"
- User asks to "generate exam files"
- User asks to "convert solution markdown to exam format"
- User has `solution/*.md` files ready for conversion

## Workflow

### Step 1 — Read References

Before converting any files, read these reference files to understand the schemas:

1. `references/solution-format-spec.md` — The intermediate markdown format specification (input schema)
2. `references/blocknote-schema.md` — All valid BlockNote block/inline types and their JSON structures (output schema)

### Step 2 — Read the Solution Markdown File

1. Read the enriched `.md` file from the `solution/` folder.
2. Parse the **YAML frontmatter** (between `---` delimiters) to extract metadata:
   - `type`, `difficulty`, `tags`, `maxScore`, `scoringStrategy`, `requiredTier`, `isActive`
   - `variableFormulas` (with `variables` and `solutions` sub-objects)
3. Parse the **markdown body** by splitting on `##` section headings:
   - `## Soal` → question content
   - `## Opsi` → answer options
   - `## Alasan` → reason content (for `statement_reasoning` only)
   - `## Pembahasan: Cara Konseptual` → general solution
   - `## Pembahasan: Trik Cepat` → fast method solution

### Step 3 — Convert to BlockNote JSON

Follow these critical conversion rules:

#### 3.1 Block Structure Rule

**All text must be inside block objects.** Never put `{"type": "text"}` at the root of a `content` array. Always wrap in `paragraph`, `heading`, `bulletListItem`, `equation`, or `alert`.

```
❌ BAD:  "content": [{"type": "text", "text": "...", "styles": {}}]
✅ GOOD: "content": [{"type": "paragraph", "content": [{"type": "text", "text": "...", "styles": {}}]}]
```

#### 3.2 Math Rendering — Two Types

| Markdown Pattern | BlockNote Type | Usage |
|-----------------|---------------|-------|
| `$...$` (inline) | `{"type": "latex", "props": {"latex": "...", "displayMode": false}}` | Inside a `paragraph` block's `content` array |
| `$$...$$` (display) | `{"type": "equation", "props": {"latex": "..."}, "content": []}` | Standalone block-level equation |

Strip `$` and `$$` wrappers from the source. Put the raw LaTeX into the `latex` prop.

#### 3.3 Option Formatting (CRITICAL)

ALL options MUST be formatted as a `paragraph` block containing inline `text` or `latex` objects (with `"displayMode": false`), NEVER as an `equation` block. `equation` blocks render full-width and break the option UI layout.

```json
{
  "isCorrect": true,
  "score": 1,
  "order": 0,
  "content": [{
    "type": "paragraph",
    "props": {},
    "content": [{"type": "latex", "props": {"latex": "{{opt1}}", "displayMode": false}}],
    "children": []
  }]
}
```

Parse options from the checkbox list format:
- `- [x] text` → `isCorrect: true, score: 1`
- `- [ ] text` → `isCorrect: false, score: 0`

#### 3.4 Bold Text Conversion

Convert `**text**` in markdown to `{"type": "text", "text": "text", "styles": {"bold": true}}`.

Separate bold labels from regular text into distinct `text` objects:
```json
[
  {"type": "text", "text": "Diketahui: ", "styles": {"bold": true}},
  {"type": "text", "text": "massa benda m = 5 kg", "styles": {}}
]
```

#### 3.5 List Items

| Markdown | BlockNote Type | Rule |
|----------|---------------|------|
| `- item` | `bulletListItem` | Always |
| `1. step` `2. step` (2+ items) | `numberedListItem` | Use for multi-step solutions |
| `1. step` (single item) | `paragraph` | Use `paragraph` instead to avoid awkward (1) badge |

**CRITICAL — NO EMPTY CONTENT:** The primary text of a numbered/bullet item MUST be inside the block's own `"content"` array. NEVER leave `"content": []` empty.

#### 3.6 Alert / Callout Blocks

Convert blockquotes with bold prefix to `alert` blocks:

| Markdown | Alert Type |
|----------|-----------|
| `> **Tip:** text` | `"tip"` |
| `> **Info:** text` | `"info"` |
| `> **Peringatan:** text` | `"warning"` |
| `> **Sukses:** text` | `"success"` |

**CRITICAL:** Text and inline math nodes MUST be placed directly inside `alert.content`. NEVER leave `"content": []` empty on an `alert` block.

```json
{
  "type": "alert",
  "props": {"type": "tip"},
  "content": [
    {"type": "text", "text": "Substitusi langsung ", "styles": {}},
    {"type": "latex", "props": {"latex": "x = {{x}}", "displayMode": false}}
  ]
}
```

#### 3.7 Image Handling (Standard URL)

When a question references an image (e.g., `![caption](../imgs/image.png)`):

1. Extract the URL and caption from the markdown image syntax.
2. Insert a BlockNote `image` block using the original URL (do NOT encode to Base64):
     ```json
     {
       "type": "image",
       "props": {
         "url": "../imgs/image.png",
         "caption": "Deskripsi gambar"
       },
       "content": [],
       "children": []
     }
     ```

#### 3.8 Equation Alignment Validation

When converting `$$\begin{aligned}...\end{aligned}$$` blocks, validate and sanitize:

1. **No horizontal equation chains** — If 2+ `=` signs detected outside `\begin{aligned}`, flag as error.
2. **Lines 2+ must start with `&=`** — If a line repeats the left-hand variable, auto-fix or flag.
3. **No multiple `=` per line** — Each line must have at most one `=`.

Use the `clean_tex_aligned_block()` function in `scripts/build_blocknote_json.py` to auto-fix violations.

#### 3.9 Solution Structure

Each `## Pembahasan: ...` section maps to a solution object:

| Section Heading | solutionType | title |
|----------------|-------------|-------|
| `## Pembahasan: Cara Konseptual` | `"general"` | `"Cara Konseptual"` |
| `## Pembahasan: Trik Cepat` | `"fast_method"` | `"Trik Cepat"` |

Every question MUST have at least one `general` solution.

#### 3.10 Statement Reasoning

For `type: statement_reasoning`:
- `## Soal` → `content` field
- `## Alasan` → `reasonContent` field
- `## Opsi` → exactly 2 options: "Benar" and "Salah"

### Step 4 — Validate Output JSON

Run the offline validator script to verify schema compliance:

```bash
python3 .agents/skills/exam-blocknote-converter/scripts/validate_questions.py <output_file_or_directory>
```

The validator checks:
- Required fields presence (`type`, `difficulty`, `content`, `solutions`, `tags`, `maxScore`, `scoringStrategy`)
- Valid block types against allowlist
- No root-level `text` nodes (must be wrapped in `paragraph`)
- Empty `content: []` on `alert`, `numberedListItem`, and other inline-content blocks
- Horizontal equation chain detection
- Repeated LHS variable in `\begin{aligned}`
- Option format (rejects `equation` blocks in options)
- Exactly 1 correct option for `multiple_choice`
- Mandatory `general` solution type
- Conclusion sentence presence: `"Jadi, jawaban yang benar adalah"`
- Single-step `numberedListItem` warning
- `variableFormulas` validation (≥5 sets, no `Math.*`, no `{{}}` in solutions)
- Option letter leak detection in solutions
- `statement_reasoning` requires `reasonContent`
- `maxScore` vs option score cross-check

Fix any errors or warnings flagged by the validator.

### Step 5 — Output & Report

1. Write the JSON to the `exam/` subfolder of the target directory:
   - `solution/q01.md` → `exam/q01.json`
2. Alternatively, use the build script for batch conversion:
   ```bash
   python3 .agents/skills/exam-blocknote-converter/scripts/build_blocknote_json.py <solution_dir> <exam_dir> [--skip-missing-image]
   ```
3. Report:
   - Number of questions converted
   - Validation results (passed, warned, failed)
   - Any issues (missing images, validation errors)

## CRITICAL: Common Mistakes to AVOID

```
❌ BAD:  "content": [{"type": "text", "text": "...", "styles": {}}]
✅ GOOD: "content": [{"type": "paragraph", "content": [{"type": "text", "text": "...", "styles": {}}]}]

❌ BAD:  Empty alert content followed by paragraph:
        {"type": "alert", "props": {"type": "tip"}, "content": []},
        {"type": "paragraph", "content": [{"type": "text", "text": "Cara Cepat: ..."}]}
✅ GOOD: Text and inline latex directly inside alert.content:
        {"type": "alert", "props": {"type": "tip"}, "content": [{"type": "text", "text": "Cara Cepat: ...", "styles": {}}, {"type": "latex", "props": {"latex": "...", "displayMode": false}}]}

❌ BAD:  "type": "math", "props": {"equation": "..."}
✅ GOOD: "type": "equation", "props": {"latex": "..."}

❌ BAD:  Repeating left variable & horizontal '=' chains:
        "latex": "\\begin{aligned} \\frac{1}{C_s} = \\frac{1}{C_1} + \\frac{1}{C_2} \\\\ \\frac{1}{C_s} = \\frac{1}{3} + \\frac{1}{6} = \\frac{3}{6} = \\frac{1}{2} \\end{aligned}"
✅ GOOD: Left variable ONLY once on line 1, &= per line, \\implies for inversion:
        "latex": "\\begin{aligned} \\frac{1}{C_s} &= \\frac{1}{C_1} + \\frac{1}{C_2} + \\frac{1}{C_3} \\\\ &= \\frac{1}{3} + \\frac{1}{6} + \\frac{1}{9} \\\\ &= \\frac{6+3+2}{18} \\\\ &= \\frac{11}{18} \\\\[6pt] \\implies C_s &= \\frac{18}{11} \\text{ F} \\end{aligned}"

❌ BAD:  Mixing "$x^2$" in text strings
✅ GOOD: Split into text + inline latex: {"type": "text"}, {"type": "latex", "props": {...}}, {"type": "text"}

❌ BAD:  Options using "equation" block (renders full-width, breaks UI)
✅ GOOD: Options using "paragraph" with inline "latex" (displayMode: false)

❌ BAD:  Single-step solution using numberedListItem (renders awkward (1) badge):
        {"type": "numberedListItem", "content": [{"type": "text", "text": "Substitusikan..."}]}
✅ GOOD: Use paragraph for single-step solutions:
        {"type": "paragraph", "content": [{"type": "text", "text": "Substitusikan..."}]}

❌ BAD:  numberedListItem with empty content and text in children:
        {"type": "numberedListItem", "content": [], "children": [{"type": "paragraph", ...}]}
✅ GOOD: Primary text directly in content array:
        {"type": "numberedListItem", "content": [{"type": "text", "text": "Substitusikan...", "styles": {}}], "children": [...]}
```
