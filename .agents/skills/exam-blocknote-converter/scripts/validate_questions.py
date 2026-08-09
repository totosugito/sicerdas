#!/usr/bin/env python3
"""
Offline Question JSON Validator for Sicerdas Exam System.
Validates generated JSON files against BlockNote schema and mathjs syntax rules.

Usage:
    python validate_questions.py <path_to_json_file_or_directory>

Example:
    python validate_questions.py ../../../test/exam/
"""

import sys
import os
import json
import re
from pathlib import Path

# Force UTF-8 encoding for Windows console compatibility
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ANSI colors for pretty terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

# Synced with blocknote-config.ts VALID_BLOCK_TYPES
VALID_BLOCK_TYPES = {
    # Default blocks
    "paragraph", "heading", "bulletListItem", "numberedListItem",
    "checkListItem", "table", "image", "video", "audio", "file", "codeBlock",
    # Custom blocks
    "equation", "alert", "chart",
}

VALID_INLINE_TYPES = {"text", "latex", "link"}

VALID_QUESTION_TYPES = {
    "multiple_choice", "multiple_select", "essay", "statement_reasoning"
}

VALID_DIFFICULTIES = {"easy", "medium", "hard"}

VALID_SCORING_STRATEGIES = {"all_or_nothing", "partial", "partial_with_penalty"}

VALID_SOLUTION_TYPES = {"general", "fast_method", "tips", "video_link"}

# Inline content block types (blocks whose content array holds inline nodes)
INLINE_CONTENT_BLOCK_TYPES = {
    "paragraph", "heading", "bulletListItem", "numberedListItem",
    "checkListItem", "alert",
}

# Minimum required variable sets for parameterized questions
MIN_VARIABLE_SETS = 5

# Mandatory conclusion sentence that must appear in ALL solution types
CONCLUSION_SENTENCE = "Jadi, jawaban yang benar adalah"


class QuestionValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []

    def validate_file(self, filepath: Path) -> bool:
        self.errors = []
        self.warnings = []
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            self.errors.append(f"Invalid JSON syntax: {e}")
            return False

        if isinstance(data, list):
            if len(data) > 1:
                self.warnings.append(
                    f"File contains an array of {len(data)} questions. "
                    f"The exam/ workflow expects one question per file (single JSON object, not array)."
                )
            for i, q in enumerate(data):
                self._validate_question(q, prefix=f"Item [{i}]")
        elif isinstance(data, dict):
            self._validate_question(data, prefix="Root")
        else:
            self.errors.append("Root JSON must be an object or an array of objects.")

        return len(self.errors) == 0

    def _validate_question(self, q: dict, prefix: str):
        # 1. Required fields (core)
        for field in ["type", "difficulty", "content", "solutions", "tags"]:
            if field not in q:
                self.errors.append(f"{prefix}: Missing required field '{field}'.")

        # 2. Required metadata fields (for import compatibility)
        if "maxScore" not in q:
            self.errors.append(f"{prefix}: Missing required field 'maxScore'.")
        elif not isinstance(q["maxScore"], (int, float)):
            self.errors.append(f"{prefix}: 'maxScore' must be a number, got {type(q['maxScore']).__name__}.")

        if "scoringStrategy" not in q:
            self.errors.append(f"{prefix}: Missing required field 'scoringStrategy'.")
        elif q["scoringStrategy"] not in VALID_SCORING_STRATEGIES:
            self.errors.append(f"{prefix}: Invalid scoringStrategy '{q['scoringStrategy']}'. Must be one of {VALID_SCORING_STRATEGIES}.")

        if "isActive" not in q:
            self.warnings.append(f"{prefix}: Missing field 'isActive'. Defaults to true but should be explicit.")

        if "requiredTier" not in q:
            self.warnings.append(f"{prefix}: Missing field 'requiredTier'. Defaults to 'free' but should be explicit.")

        # 3. Type & Difficulty
        if "type" in q and q["type"] not in VALID_QUESTION_TYPES:
            self.errors.append(f"{prefix}: Invalid type '{q['type']}'. Must be one of {VALID_QUESTION_TYPES}.")

        if "difficulty" in q and q["difficulty"] not in VALID_DIFFICULTIES:
            self.warnings.append(f"{prefix}: Non-standard difficulty '{q['difficulty']}'.")

        # 4. Content Blocks
        if "content" in q and isinstance(q["content"], list):
            self._validate_block_list(q["content"], f"{prefix} -> content")

        # 5. reasonContent for statement_reasoning
        if q.get("type") == "statement_reasoning":
            if "reasonContent" not in q or not q["reasonContent"]:
                self.errors.append(f"{prefix}: 'statement_reasoning' type requires non-empty 'reasonContent' field.")
            elif isinstance(q["reasonContent"], list):
                self._validate_block_list(q["reasonContent"], f"{prefix} -> reasonContent")

        # 6. Options
        if q.get("type") in ("multiple_choice", "multiple_select"):
            if "options" not in q or not isinstance(q["options"], list):
                self.errors.append(f"{prefix}: Multiple choice question missing 'options' array.")
            else:
                correct_count = 0
                for idx, opt in enumerate(q["options"]):
                    self._validate_option(opt, f"{prefix} -> option[{idx}]")
                    if isinstance(opt, dict) and opt.get("isCorrect"):
                        correct_count += 1

                # Scoring logic validation
                if q.get("type") == "multiple_choice" and correct_count != 1:
                    self.errors.append(
                        f"{prefix}: 'multiple_choice' must have exactly 1 correct option, found {correct_count}."
                    )
                if q.get("type") == "multiple_select" and correct_count < 2:
                    self.warnings.append(
                        f"{prefix}: 'multiple_select' typically has 2+ correct options, found {correct_count}."
                    )

                # maxScore vs option scores cross-check
                if "maxScore" in q and isinstance(q["maxScore"], (int, float)):
                    total_correct_score = sum(
                        opt.get("score", 0) for opt in q["options"]
                        if isinstance(opt, dict) and opt.get("isCorrect")
                    )
                    if total_correct_score > 0 and total_correct_score != q["maxScore"]:
                        self.warnings.append(
                            f"{prefix}: maxScore ({q['maxScore']}) does not match sum of correct option scores ({total_correct_score})."
                        )

        # 7. Solutions
        if "solutions" in q:
            solutions = q["solutions"]
            if isinstance(solutions, list):
                # Check mandatory 'general' solution
                solution_types = [
                    sol.get("solutionType") for sol in solutions
                    if isinstance(sol, dict)
                ]
                if "general" not in solution_types:
                    self.errors.append(
                        f"{prefix}: Missing mandatory solution with solutionType 'general'. "
                        f"Every question must have at least one conceptual solution."
                    )

                for idx, sol in enumerate(solutions):
                    if not isinstance(sol, dict):
                        self.errors.append(f"{prefix} -> solution[{idx}]: Must be a JSON object.")
                        continue

                    stype = sol.get("solutionType")

                    # Solution metadata fields
                    if "title" not in sol or not sol["title"]:
                        self.errors.append(f"{prefix} -> solution[{idx}]: Missing required field 'title'.")

                    if "solutionType" not in sol:
                        self.errors.append(f"{prefix} -> solution[{idx}]: Missing required field 'solutionType'.")
                    elif stype not in VALID_SOLUTION_TYPES:
                        self.errors.append(
                            f"{prefix} -> solution[{idx}]: Invalid solutionType '{stype}'. "
                            f"Must be one of {VALID_SOLUTION_TYPES}."
                        )

                    if "order" not in sol:
                        self.warnings.append(f"{prefix} -> solution[{idx}]: Missing field 'order'.")

                    # Content validation
                    content_list = sol.get("content", [])
                    if isinstance(content_list, list):
                        self._validate_block_list(content_list, f"{prefix} -> solution[{idx}]")
                        
                        # Check for single-step numberedListItem
                        num_list_count = self._count_block_types(content_list, "numberedListItem")
                        if num_list_count == 1:
                            self.warnings.append(
                                f"{prefix} -> solution[{idx}]: Single-step solution uses 'numberedListItem'! "
                                f"Use standard 'paragraph' block instead when there is only 1 step (to prevent rendering an awkward (1) badge icon)."
                            )

                        # Conclusion sentence check for ALL solution types (not just fast_method)
                        sol_str = json.dumps(content_list, ensure_ascii=False)
                        if CONCLUSION_SENTENCE not in sol_str:
                            # For 'tips' and 'video_link' types, this is a warning not an error
                            if stype in ("tips", "video_link"):
                                self.warnings.append(
                                    f"{prefix} -> solution[{idx}] ({stype}): Missing conclusion '{CONCLUSION_SENTENCE}...'."
                                )
                            else:
                                self.errors.append(
                                    f"{prefix} -> solution[{idx}] ({stype}): Missing mandatory conclusion '{CONCLUSION_SENTENCE}...'!"
                                )

                        # Check for incomplete fast_method (missing equations)
                        if stype == "fast_method":
                            block_types = [b.get("type") for b in content_list if isinstance(b, dict)]
                            if "equation" not in block_types:
                                self.warnings.append(f"{prefix} -> solution[{idx}] (fast_method): Missing 'equation' block for explicit calculation steps!")

                    self._check_option_letter_leak(sol, f"{prefix} -> solution[{idx}]")

        # 8. Variable Formulas
        vf = q.get("variableFormulas")
        if vf and isinstance(vf, dict):
            self._validate_variable_formulas(vf, f"{prefix} -> variableFormulas")

    def _validate_block_list(self, blocks: list, location: str):
        for idx, block in enumerate(blocks):
            if not isinstance(block, dict):
                self.errors.append(f"{location}[{idx}]: Must be a JSON object, got {type(block).__name__}.")
                continue

            btype = block.get("type")
            if not btype:
                self.errors.append(f"{location}[{idx}]: Missing block 'type'.")
                continue

            if btype == "text":
                self.errors.append(f"{location}[{idx}]: Root block cannot be 'text'. Wrap in 'paragraph' or similar.")

            if btype not in VALID_BLOCK_TYPES:
                self.warnings.append(f"{location}[{idx}]: Custom or unknown block type '{btype}'.")

            # Check alert block content
            if btype == "alert":
                content = block.get("content", [])
                if not content:
                    self.errors.append(f"{location}[{idx}]: 'alert' block has empty content: []. Text/math must be inside alert.content.")

            # Check equation blocks for alignment and horizontal chaining
            if btype == "equation":
                latex = block.get("props", {}).get("latex", "")
                if isinstance(latex, str):
                    # Rule 1: No horizontal equation chaining (2+ '=' signs without \begin{aligned})
                    if latex.count("=") >= 2 and "\\begin{aligned}" not in latex:
                        self.errors.append(
                            f"{location}[{idx}]: Horizontal equation chain detected ({latex.count('=')} '=' signs on a single line)! "
                            f"MUST use '\\begin{{aligned}} ... \\end{{aligned}}' vertically with line breaks '\\\\' and alignment '&=' for multi-step calculations."
                        )

                    # Rule 2: In \begin{aligned}, check for repeated left-hand variables or horizontal chaining within lines
                    if "\\begin{aligned}" in latex:
                        match = re.search(r"\\begin\{aligned\}(.*?)\\end\{aligned\}", latex, re.DOTALL)
                        if match:
                            body = match.group(1).strip()
                            lines = [l.strip() for l in body.split("\\\\") if l.strip()]
                            for l_idx, line in enumerate(lines[1:], start=2):
                                if not line.startswith("&=") and not line.startswith("& ="):
                                    if "=" in line:
                                        self.errors.append(
                                            f"{location}[{idx}]: Line {l_idx} in \\begin{{aligned}} repeats left-hand variable before '=' ('{line[:30]}...')! "
                                            f"The left variable must appear ONLY ONCE on line 1. Subsequent lines MUST start directly with '&='."
                                        )
                                if line.count("=") >= 2:
                                    self.errors.append(
                                        f"{location}[{idx}]: Line {l_idx} in \\begin{{aligned}} chains multiple '=' signs horizontally! "
                                        f"Break each step into a separate vertical line with '&='."
                                    )

            # Check inline content blocks for empty content (CRITICAL for numberedListItem)
            if btype in INLINE_CONTENT_BLOCK_TYPES:
                content = block.get("content", [])
                if not content or content == []:
                    self.errors.append(
                        f"{location}[{idx}]: '{btype}' block has empty content: []. "
                        f"The primary text MUST be inside the block's own 'content' array."
                    )

            # Validate inline content types within content arrays
            if btype in INLINE_CONTENT_BLOCK_TYPES:
                content = block.get("content")
                if isinstance(content, list):
                    self._validate_inline_content(content, f"{location}[{idx}] -> content")

            # Validate children blocks recursively
            children = block.get("children", [])
            if isinstance(children, list) and children:
                self._validate_block_list(children, f"{location}[{idx}] -> children")

    def _validate_inline_content(self, items: list, location: str):
        """Validate that inline content items have valid types and required properties."""
        for idx, item in enumerate(items):
            if not isinstance(item, dict):
                continue
            itype = item.get("type")
            if itype and itype not in VALID_INLINE_TYPES:
                self.warnings.append(
                    f"{location}[{idx}]: Unknown inline content type '{itype}'. "
                    f"Expected one of {VALID_INLINE_TYPES}."
                )
            # Validate latex inline has required props
            if itype == "latex":
                props = item.get("props", {})
                if not isinstance(props, dict) or "latex" not in props:
                    self.errors.append(f"{location}[{idx}]: Inline 'latex' node missing 'props.latex'.")

    def _validate_option(self, opt: dict, location: str):
        """Validate a single option object for both block structure and required fields."""
        if not isinstance(opt, dict):
            self.errors.append(f"{location}: Option must be a JSON object.")
            return

        # Required option fields
        if "isCorrect" not in opt:
            self.errors.append(f"{location}: Missing required field 'isCorrect'.")
        if "score" not in opt:
            self.errors.append(f"{location}: Missing required field 'score'.")
        if "order" not in opt:
            self.warnings.append(f"{location}: Missing field 'order'.")
        if "content" not in opt or not isinstance(opt.get("content"), list):
            self.errors.append(f"{location}: Missing or invalid 'content' array.")
            return

        # Validate option content blocks
        for cidx, content_block in enumerate(opt["content"]):
            if not isinstance(content_block, dict):
                continue
            btype = content_block.get("type")
            # Options MUST use paragraph + inline latex, NEVER equation blocks
            if btype == "equation":
                self.errors.append(
                    f"{location} -> content[{cidx}]: Option uses 'equation' block! "
                    f"Options MUST use 'paragraph' + inline latex to prevent UI layout breakage."
                )

    def _validate_variable_formulas(self, vf: dict, location: str):
        # Check variables array
        variables = vf.get("variables")
        if not isinstance(variables, list):
            self.errors.append(f"{location}: 'variables' must be an array.")
        else:
            if len(variables) < MIN_VARIABLE_SETS:
                self.warnings.append(
                    f"{location}: Only {len(variables)} variable set(s) provided. "
                    f"Recommended minimum is {MIN_VARIABLE_SETS} for sufficient question variation."
                )

        # Check solutions formulas
        sol_dict = vf.get("solutions", {})
        if isinstance(sol_dict, dict):
            for var_name, formula in sol_dict.items():
                if not isinstance(formula, str):
                    continue
                # Rule A: No Math. prefix
                if "Math." in formula:
                    self.errors.append(f"{location}.solutions['{var_name}']: Formula '{formula}' contains 'Math.' prefix! Use bare mathjs functions (e.g., sqrt()).")
                # Rule B: No {{var}} mustache syntax
                if re.search(r"\{\{.*?\}\}", formula):
                    self.errors.append(f"{location}.solutions['{var_name}']: Formula '{formula}' contains mustache braces '{{{{...}}}}'. Use bare variable names.")

    def _check_option_letter_leak(self, sol: dict, location: str):
        sol_str = json.dumps(sol, ensure_ascii=False)
        pattern = r"\b(opsi|jawaban)\s+([A-Ea-e])\b"
        matches = re.findall(pattern, sol_str)
        if matches:
            self.warnings.append(f"{location}: Solution references option letters {matches}. Option positions are randomized in database!")

    def _count_block_types(self, blocks: list, target_type: str) -> int:
        count = 0
        if not isinstance(blocks, list):
            return count
        for block in blocks:
            if isinstance(block, dict):
                if block.get("type") == target_type:
                    count += 1
                children = block.get("children", [])
                if isinstance(children, list):
                    count += self._count_block_types(children, target_type)
        return count


def main():
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <json_file_or_directory>")
        sys.exit(1)

    target_path = Path(sys.argv[1])
    if not target_path.exists():
        print(f"{RED}Error: Path '{target_path}' does not exist.{RESET}")
        sys.exit(1)

    files_to_check = []
    if target_path.is_file():
        files_to_check.append(target_path)
    else:
        files_to_check = sorted(target_path.glob("**/*.json"))

    if not files_to_check:
        print(f"{YELLOW}No .json files found in '{target_path}'.{RESET}")
        sys.exit(0)

    print(f"{BLUE}🔍 Validating {len(files_to_check)} JSON question file(s)...{RESET}\n")

    validator = QuestionValidator()
    passed_count = 0
    warned_count = 0
    failed_count = 0

    for filepath in files_to_check:
        success = validator.validate_file(filepath)
        rel_path = filepath.name

        if success and not validator.warnings:
            print(f"  {GREEN}✓ PASS{RESET}  {rel_path}")
            passed_count += 1
        elif success and validator.warnings:
            print(f"  {YELLOW}⚠ WARN{RESET}  {rel_path}")
            for w in validator.warnings:
                print(f"       └─ {YELLOW}{w}{RESET}")
            warned_count += 1
        else:
            print(f"  {RED}✗ FAIL{RESET}  {rel_path}")
            for e in validator.errors:
                print(f"       └─ {RED}{e}{RESET}")
            for w in validator.warnings:
                print(f"       └─ {YELLOW}{w}{RESET}")
            failed_count += 1

    print("\n" + "=" * 50)
    print(f"Total Checked : {len(files_to_check)}")
    print(f"Passed        : {GREEN}{passed_count}{RESET}")
    print(f"Warned        : {YELLOW}{warned_count}{RESET}")
    print(f"Failed        : {RED}{failed_count}{RESET}")
    print("=" * 50)

    if failed_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
