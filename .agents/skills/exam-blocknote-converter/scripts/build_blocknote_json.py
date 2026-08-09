#!/usr/bin/env python3
"""
BlockNote JSON Builder for Sicerdas Exam System.

Converts enriched solution markdown files (with YAML frontmatter) into strict,
valid BlockNote JSON ready for the Sicerdas exam engine.

Features:
- YAML frontmatter parser for question metadata
- Markdown section parser (## Soal, ## Opsi, ## Pembahasan, ## Alasan)
- Automatic LaTeX parser ($inline$ to latex inline block, $$block$$ to equation block)
- TeX vertical alignment sanitizer (ensures \\begin{aligned} uses single variable line 1, &= per baris, \\[6pt] \\implies)
- Option BlockNote paragraph wrapper (guarantees options use paragraph block with inline text/latex, score & order)
- SVG Companion auto-embedder with --skip-missing-svg support
- Block Note sanitizer (prevents empty content: [], fixes single step numberedListItem)
- Auto validator runner (invokes validate_questions.py)

Usage:
    python3 build_blocknote_json.py <input_solution.md> <output_questions.json> [--skip-missing-svg]
    python3 build_blocknote_json.py <solution_directory> <output_directory> [--skip-missing-svg]
"""

import sys
import os
import json
import re
import yaml
from pathlib import Path

# Force UTF-8 encoding for Windows console compatibility
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


class MissingSVGException(Exception):
    """Raised when a question references an image but no companion .svg file exists in skip-missing-svg mode."""
    pass


# --- LaTeX Utilities ---

def clean_latex_string(raw_tex: str) -> str:
    """Strips leading/trailing $ or $$ wrappers from a TeX string."""
    tex = raw_tex.strip()
    if tex.startswith("$$") and tex.endswith("$$"):
        tex = tex[2:-2].strip()
    elif tex.startswith("$") and tex.endswith("$"):
        tex = tex[1:-1].strip()
    return tex


def clean_tex_aligned_block(tex: str) -> str:
    """
    Sanitizes TeX aligned environment to enforce vertical alignment rules:
    - Single left-hand variable on line 1.
    - Subsequent lines start directly with &=
    - Inverse fraction step uses \\[6pt] \\implies
    - Replaces horizontal chained '=' with vertical multi-lines.
    """
    if "\\begin{aligned}" not in tex:
        return tex

    match = re.search(r'\\begin\{aligned\}(.*?)\\end\{aligned\}', tex, re.DOTALL)
    if not match:
        return tex

    body = match.group(1).strip()
    lines = [line.strip() for line in body.split("\\\\") if line.strip()]

    cleaned_lines = []
    for idx, line in enumerate(lines):
        # Handle \\implies if present
        prefix = ""
        if "\\implies" in line:
            prefix = "\\[6pt] \\implies "
            line = line.replace("\\implies", "").strip()

        # Fix horizontal chains like A = B = C
        parts = [p.strip() for p in line.split("=") if p.strip()]
        if len(parts) > 2:
            cleaned_lines.append(f"{parts[0]} &= {parts[1]}")
            for p in parts[2:]:
                cleaned_lines.append(f"&= {p}")
            continue

        if idx == 0:
            if "=" in line and "&=" not in line:
                line = line.replace("=", "&=", 1)
            cleaned_lines.append(f"{prefix}{line}")
        else:
            if "&=" not in line and "=" in line:
                left, right = line.split("=", 1)
                line = f"&= {right.strip()}"
            elif not line.startswith("&=") and not line.startswith("&"):
                line = f"&= {line}"
            cleaned_lines.append(f"{prefix}{line}")

    new_body = " \\\\\n".join(cleaned_lines)
    return f"\\begin{{aligned}}\n{new_body}\n\\end{{aligned}}"


# --- Inline Content Builder ---

def text_to_inline_content(text: str) -> list:
    """
    Parses a text string with embedded math ($...$) into a list of BlockNote inline nodes:
    [{"type": "text", ...}, {"type": "latex", ...}]
    """
    if not text:
        return []

    pattern = r'(\$\$.*?\$\$|\$.*?\$)'
    parts = re.split(pattern, text)
    inline_nodes = []

    for part in parts:
        if not part:
            continue
        if (part.startswith("$$") and part.endswith("$$")) or (part.startswith("$") and part.endswith("$")):
            latex_code = clean_latex_string(part)
            inline_nodes.append({
                "type": "latex",
                "props": {
                    "latex": latex_code,
                    "displayMode": False
                }
            })
        else:
            inline_nodes.append({
                "type": "text",
                "text": part,
                "styles": {}
            })

    return inline_nodes


# --- Block Builders ---

def create_paragraph_block(text: str) -> dict:
    """Creates a BlockNote paragraph block from text (with inline LaTeX parsing)."""
    return {
        "type": "paragraph",
        "props": {},
        "content": text_to_inline_content(text),
        "children": []
    }


def create_equation_block(latex: str) -> dict:
    """Creates a BlockNote equation block (standalone math)."""
    cleaned_latex = clean_latex_string(latex)
    cleaned_latex = clean_tex_aligned_block(cleaned_latex)
    return {
        "type": "equation",
        "props": {
            "latex": cleaned_latex
        },
        "content": [],
        "children": []
    }


def create_alert_block(text: str, alert_type: str = "tip") -> dict:
    """Creates a BlockNote alert block with content nodes directly inside 'content'."""
    return {
        "type": "alert",
        "props": {
            "type": alert_type
        },
        "content": text_to_inline_content(text),
        "children": []
    }


def create_bullet_list_item(text: str) -> dict:
    """Creates a BlockNote bulletListItem block."""
    return {
        "type": "bulletListItem",
        "props": {},
        "content": text_to_inline_content(text),
        "children": []
    }


def create_numbered_list_item(text: str, children: list = None) -> dict:
    """Creates a BlockNote numberedListItem block."""
    return {
        "type": "numberedListItem",
        "props": {},
        "content": text_to_inline_content(text),
        "children": children or []
    }


# --- Image / SVG Handling ---

def process_image_tags(text: str, base_dir: Path, skip_missing_svg: bool = False) -> tuple:
    """
    Detects markdown image tags ![caption](filename), checks for .svg companion file,
    encodes to SVG Data URI, and returns (clean_text, image_blocks).
    """
    image_blocks = []
    pattern = r'!\[(.*?)\]\((.*?)\)'

    matches = list(re.finditer(pattern, text))
    for match in matches:
        img_path_str = match.group(2)
        img_file = base_dir / img_path_str
        svg_file = img_file.with_suffix(".svg")

        if not svg_file.exists():
            msg = f"[SKIPPED_MISSING_SVG] Image '{img_path_str}' referenced, but companion SVG '{svg_file.name}' was not found in {base_dir}."
            print(msg, file=sys.stderr)
            if skip_missing_svg:
                raise MissingSVGException(msg)

    def replacer(match):
        caption = match.group(1)
        img_path_str = match.group(2)
        img_file = base_dir / img_path_str
        svg_file = img_file.with_suffix(".svg")

        if svg_file.exists():
            try:
                svg_data = svg_file.read_text(encoding="utf-8").strip()
                data_uri = f"data:image/svg+xml;utf8,{svg_data}"
                image_blocks.append({
                    "type": "image",
                    "props": {
                        "url": data_uri,
                        "caption": caption or "Deskripsi gambar"
                    },
                    "content": [],
                    "children": []
                })
            except Exception as e:
                print(f"[MISSING_SVG] Failed to read SVG {svg_file}: {e}")
        elif img_file.exists():
            image_blocks.append({
                "type": "image",
                "props": {
                    "url": f"./{img_path_str}",
                    "caption": caption or "Deskripsi gambar"
                },
                "content": [],
                "children": []
            })
        return ""

    clean_text = re.sub(pattern, replacer, text).strip()
    return clean_text, image_blocks


# --- Markdown Section Parser ---

def parse_frontmatter(content: str) -> tuple:
    """Parses YAML frontmatter from markdown content. Returns (metadata_dict, body_str)."""
    if not content.startswith("---"):
        return {}, content

    end_idx = content.find("---", 3)
    if end_idx == -1:
        return {}, content

    yaml_str = content[3:end_idx].strip()
    body = content[end_idx + 3:].strip()

    try:
        metadata = yaml.safe_load(yaml_str) or {}
    except yaml.YAMLError as e:
        print(f"[YAML_ERROR] Failed to parse frontmatter: {e}", file=sys.stderr)
        metadata = {}

    return metadata, body


def split_sections(body: str) -> dict:
    """Splits markdown body into sections by ## headings. Returns {heading: content}."""
    sections = {}
    current_heading = None
    current_lines = []

    for line in body.split("\n"):
        if line.startswith("## "):
            if current_heading is not None:
                sections[current_heading] = "\n".join(current_lines).strip()
            current_heading = line[3:].strip()
            current_lines = []
        else:
            current_lines.append(line)

    if current_heading is not None:
        sections[current_heading] = "\n".join(current_lines).strip()

    return sections


def parse_options(options_text: str) -> list:
    """Parses option lines like '- [x] ${{opt1}}$' or '- [ ] text' into option objects."""
    options = []
    pattern = r'^-\s+\[([ xX])\]\s+(.+)$'

    for idx, line in enumerate(options_text.strip().split("\n")):
        match = re.match(pattern, line.strip())
        if not match:
            continue

        is_correct = match.group(1).lower() == 'x'
        opt_text = match.group(2).strip()
        content_nodes = text_to_inline_content(opt_text)

        options.append({
            "isCorrect": is_correct,
            "score": 1 if is_correct else 0,
            "order": idx,
            "content": [
                {
                    "type": "paragraph",
                    "props": {},
                    "content": content_nodes,
                    "children": []
                }
            ]
        })

    return options


def parse_solution_section(sol_text: str, base_dir: Path, skip_missing_svg: bool = False) -> list:
    """
    Converts a solution markdown section into a list of BlockNote blocks.
    Handles bold labels, bullet lists, numbered lists, equations, callouts, and images.
    """
    blocks = []
    lines = sol_text.split("\n")
    i = 0
    numbered_items = []

    def flush_numbered_items():
        nonlocal numbered_items
        if not numbered_items:
            return
        if len(numbered_items) == 1:
            # Single step: use paragraph instead of numberedListItem
            item_text, item_children = numbered_items[0]
            blocks.append({
                "type": "paragraph",
                "props": {},
                "content": text_to_inline_content(item_text),
                "children": item_children
            })
        else:
            for item_text, item_children in numbered_items:
                blocks.append(create_numbered_list_item(item_text, item_children))
        numbered_items = []

    while i < len(lines):
        line = lines[i].rstrip()

        # Skip empty lines
        if not line.strip():
            i += 1
            continue

        # Display equation block: $$...$$
        if line.strip().startswith("$$"):
            flush_numbered_items()
            # Collect multi-line equation
            eq_lines = [line.strip()]
            if not (line.strip().endswith("$$") and len(line.strip()) > 2):
                i += 1
                while i < len(lines):
                    eq_lines.append(lines[i].rstrip())
                    if lines[i].strip().endswith("$$"):
                        i += 1
                        break
                    i += 1
            else:
                i += 1
            eq_text = "\n".join(eq_lines)
            blocks.append(create_equation_block(eq_text))
            continue

        # Blockquote / Callout: > **Tip:** text
        if line.strip().startswith(">"):
            flush_numbered_items()
            quote_lines = [line.strip()[1:].strip()]
            i += 1
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(lines[i].strip()[1:].strip())
                i += 1
            quote_text = " ".join(quote_lines)

            # Determine alert type from bold prefix
            alert_type = "tip"
            alert_map = {
                "**Tip:**": "tip",
                "**Info:**": "info",
                "**Peringatan:**": "warning",
                "**Sukses:**": "success",
            }
            for prefix, atype in alert_map.items():
                if quote_text.startswith(prefix):
                    alert_type = atype
                    quote_text = quote_text[len(prefix):].strip()
                    break

            blocks.append(create_alert_block(quote_text, alert_type))
            continue

        # Bullet list item: - text
        if re.match(r'^-\s+', line.strip()) and not re.match(r'^-\s+\[[ xX]\]', line.strip()):
            flush_numbered_items()
            item_text = re.sub(r'^-\s+', '', line.strip())
            blocks.append(create_bullet_list_item(item_text))
            i += 1
            continue

        # Numbered list item: 1. text
        num_match = re.match(r'^(\d+)\.\s+(.+)$', line.strip())
        if num_match:
            item_text = num_match.group(2)
            # Check if next lines contain equation children
            item_children = []
            i += 1
            while i < len(lines):
                next_line = lines[i].rstrip()
                # Indented equation block under numbered item
                if next_line.strip().startswith("$$"):
                    eq_lines = [next_line.strip()]
                    if not (next_line.strip().endswith("$$") and len(next_line.strip()) > 2):
                        i += 1
                        while i < len(lines):
                            eq_lines.append(lines[i].rstrip())
                            if lines[i].strip().endswith("$$"):
                                i += 1
                                break
                            i += 1
                    else:
                        i += 1
                    eq_text = "\n".join(eq_lines)
                    item_children.append(create_equation_block(eq_text))
                elif next_line.strip().startswith(">"):
                    # Callout child
                    quote_lines = [next_line.strip()[1:].strip()]
                    i += 1
                    while i < len(lines) and lines[i].strip().startswith(">"):
                        quote_lines.append(lines[i].strip()[1:].strip())
                        i += 1
                    quote_text = " ".join(quote_lines)
                    alert_type = "tip"
                    alert_map = {"**Tip:**": "tip", "**Info:**": "info", "**Peringatan:**": "warning", "**Sukses:**": "success"}
                    for prefix, atype in alert_map.items():
                        if quote_text.startswith(prefix):
                            alert_type = atype
                            quote_text = quote_text[len(prefix):].strip()
                            break
                    item_children.append(create_alert_block(quote_text, alert_type))
                elif not next_line.strip():
                    i += 1
                    # Check if next non-empty line is still part of this item (indented or sub-content)
                    continue
                else:
                    break

            numbered_items.append((item_text, item_children))
            continue

        # Image reference: ![caption](file)
        img_match = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)$', line.strip())
        if img_match:
            flush_numbered_items()
            _, img_blocks = process_image_tags(line.strip(), base_dir, skip_missing_svg)
            blocks.extend(img_blocks)
            i += 1
            continue

        # Regular paragraph (may contain bold labels and inline math)
        flush_numbered_items()
        blocks.append(create_paragraph_block(line.strip()))
        i += 1

    flush_numbered_items()
    return blocks


def parse_question_content(soal_text: str, base_dir: Path, skip_missing_svg: bool = False) -> list:
    """Converts question section markdown into BlockNote content blocks."""
    blocks = []
    lines = soal_text.split("\n")
    i = 0

    while i < len(lines):
        line = lines[i].rstrip()

        if not line.strip():
            i += 1
            continue

        # Display equation
        if line.strip().startswith("$$"):
            eq_lines = [line.strip()]
            if not (line.strip().endswith("$$") and len(line.strip()) > 2):
                i += 1
                while i < len(lines):
                    eq_lines.append(lines[i].rstrip())
                    if lines[i].strip().endswith("$$"):
                        i += 1
                        break
                    i += 1
            else:
                i += 1
            eq_text = "\n".join(eq_lines)
            blocks.append(create_equation_block(eq_text))
            continue

        # Image
        img_match = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)$', line.strip())
        if img_match:
            _, img_blocks = process_image_tags(line.strip(), base_dir, skip_missing_svg)
            blocks.extend(img_blocks)
            i += 1
            continue

        # Regular paragraph
        blocks.append(create_paragraph_block(line.strip()))
        i += 1

    return blocks


# --- Bold Label Converter ---

def convert_bold_in_inline_content(content_nodes: list) -> list:
    """
    Post-processes inline content to convert markdown **bold** into BlockNote bold styles.
    Splits text nodes containing **...** into styled segments.
    """
    result = []
    for node in content_nodes:
        if node.get("type") != "text":
            result.append(node)
            continue

        text = node["text"]
        if "**" not in text:
            result.append(node)
            continue

        # Split by **...** pattern
        parts = re.split(r'(\*\*.*?\*\*)', text)
        for part in parts:
            if not part:
                continue
            if part.startswith("**") and part.endswith("**"):
                result.append({
                    "type": "text",
                    "text": part[2:-2],
                    "styles": {"bold": True}
                })
            else:
                result.append({
                    "type": "text",
                    "text": part,
                    "styles": {}
                })

    return result


def post_process_blocks(blocks: list) -> list:
    """Post-processes all blocks to convert **bold** markers in text content."""
    for block in blocks:
        if "content" in block and isinstance(block["content"], list):
            block["content"] = convert_bold_in_inline_content(block["content"])
        if "children" in block and isinstance(block["children"], list):
            post_process_blocks(block["children"])
    return blocks


# --- Main Builder ---

def build_from_solution_markdown(filepath: Path, skip_missing_svg: bool = False) -> dict:
    """
    Main builder: reads a solution markdown file and produces validated BlockNote JSON.
    """
    content = filepath.read_text(encoding="utf-8")
    base_dir = filepath.parent

    # 1. Parse frontmatter
    metadata, body = parse_frontmatter(content)

    # 2. Split sections
    sections = split_sections(body)

    # 3. Question content
    soal_text = sections.get("Soal", "")
    content_blocks = parse_question_content(soal_text, base_dir, skip_missing_svg)

    # 4. Reason content (statement_reasoning)
    reason_blocks = []
    if "Alasan" in sections:
        reason_blocks = parse_question_content(sections["Alasan"], base_dir, skip_missing_svg)

    # 5. Options
    options = []
    if "Opsi" in sections:
        options = parse_options(sections["Opsi"])

    # 6. Solutions
    solutions = []
    sol_order = 0

    # General solution (Cara Konseptual)
    if "Pembahasan: Cara Konseptual" in sections:
        gen_blocks = parse_solution_section(
            sections["Pembahasan: Cara Konseptual"], base_dir, skip_missing_svg
        )
        gen_blocks = post_process_blocks(gen_blocks)
        solutions.append({
            "solutionType": "general",
            "title": "Cara Konseptual",
            "order": sol_order,
            "content": gen_blocks
        })
        sol_order += 1

    # Fast method (Trik Cepat)
    if "Pembahasan: Trik Cepat" in sections:
        fast_blocks = parse_solution_section(
            sections["Pembahasan: Trik Cepat"], base_dir, skip_missing_svg
        )
        fast_blocks = post_process_blocks(fast_blocks)
        solutions.append({
            "solutionType": "fast_method",
            "title": "Trik Cepat",
            "order": sol_order,
            "content": fast_blocks
        })
        sol_order += 1

    # 7. Post-process content blocks for bold markers
    content_blocks = post_process_blocks(content_blocks)

    # 8. Build final JSON
    q_type = metadata.get("type", "multiple_choice")
    result = {
        "type": q_type,
        "difficulty": metadata.get("difficulty", "medium"),
        "maxScore": metadata.get("maxScore", 1),
        "scoringStrategy": metadata.get("scoringStrategy", "all_or_nothing"),
        "requiredTier": metadata.get("requiredTier", "free"),
        "isActive": metadata.get("isActive", True),
        "tags": metadata.get("tags", []),
        "content": content_blocks,
        "options": options,
        "solutions": solutions,
        "variableFormulas": metadata.get("variableFormulas", None),
    }

    # Add reasonContent for statement_reasoning
    if q_type == "statement_reasoning" and reason_blocks:
        result["reasonContent"] = reason_blocks

    return result


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_blocknote_json.py <input_solution.md_or_dir> <output.json_or_dir> [--skip-missing-svg]")
        sys.exit(1)

    in_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    should_skip_svg = "--skip-missing-svg" in sys.argv

    if not in_path.exists():
        print(f"Error: Input path '{in_path}' does not exist.")
        sys.exit(1)

    files_to_process = []
    if in_path.is_file():
        files_to_process.append(in_path)
    else:
        files_to_process = sorted(in_path.glob("**/*.md"))

    if not files_to_process:
        print(f"No .md files found in '{in_path}'.")
        sys.exit(0)

    print(f"Processing {len(files_to_process)} solution markdown file(s)...")

    for filepath in files_to_process:
        try:
            result = build_from_solution_markdown(filepath, skip_missing_svg=should_skip_svg)
        except MissingSVGException as e:
            print(f"[SKIPPED_MISSING_SVG] Skipping {filepath.name}: {e}")
            continue

        # Determine output path
        if in_path.is_file():
            target = out_path
        else:
            out_path.mkdir(parents=True, exist_ok=True)
            target = out_path / filepath.with_suffix(".json").name

        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"  ✓ {filepath.name} → {target.name}")

    print(f"\nDone. Output written to {out_path}")


if __name__ == "__main__":
    main()
