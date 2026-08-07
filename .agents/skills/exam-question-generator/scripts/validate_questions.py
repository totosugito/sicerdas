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

VALID_BLOCK_TYPES = {
    "paragraph", "heading", "bulletListItem", "numberedListItem",
    "equation", "alert", "image"
}

VALID_INLINE_TYPES = {"text", "latex", "link"}

VALID_QUESTION_TYPES = {
    "multiple_choice", "multiple_select", "essay", "statement_reasoning"
}

VALID_DIFFICULTIES = {"easy", "medium", "hard"}


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
            for i, q in enumerate(data):
                self._validate_question(q, prefix=f"Item [{i}]")
        elif isinstance(data, dict):
            self._validate_question(data, prefix="Root")
        else:
            self.errors.append("Root JSON must be an object or an array of objects.")

        return len(self.errors) == 0

    def _validate_question(self, q: dict, prefix: str):
        # 1. Required fields
        for field in ["type", "difficulty", "content", "solutions", "tags"]:
            if field not in q:
                self.errors.append(f"{prefix}: Missing required field '{field}'.")

        # 2. Type & Difficulty
        if "type" in q and q["type"] not in VALID_QUESTION_TYPES:
            self.errors.append(f"{prefix}: Invalid type '{q['type']}'. Must be one of {VALID_QUESTION_TYPES}.")

        if "difficulty" in q and q["difficulty"] not in VALID_DIFFICULTIES:
            self.warnings.append(f"{prefix}: Non-standard difficulty '{q['difficulty']}'.")

        # 3. Content Blocks
        if "content" in q and isinstance(q["content"], list):
            self._validate_block_list(q["content"], f"{prefix} -> content")

        # 4. Options
        if q.get("type") in ("multiple_choice", "multiple_select"):
            if "options" not in q or not isinstance(q["options"], list):
                self.errors.append(f"{prefix}: Multiple choice question missing 'options' array.")
            else:
                for idx, opt in enumerate(q["options"]):
                    self._validate_option_block(opt, f"{prefix} -> option[{idx}]")

        # 5. Solutions Blocks
        if "solutions" in q:
            solutions = q["solutions"]
            if isinstance(solutions, list):
                for idx, sol in enumerate(solutions):
                    if isinstance(sol, dict):
                        stype = sol.get("solutionType")
                        content_list = sol.get("content", [])
                        if isinstance(content_list, list):
                            self._validate_block_list(content_list, f"{prefix} -> solution[{idx}]")
                            
                            # Check for incomplete fast_method (alert only, missing equations or conclusion)
                            if stype == "fast_method":
                                block_types = [b.get("type") for b in content_list if isinstance(b, dict)]
                                if "equation" not in block_types:
                                    self.warnings.append(f"{prefix} -> solution[{idx}] (fast_method): Missing 'equation' block for explicit calculation steps!")
                                sol_str = json.dumps(content_list, ensure_ascii=False)
                                if "Jadi, jawaban yang benar adalah" not in sol_str:
                                    self.errors.append(f"{prefix} -> solution[{idx}] (fast_method): Missing mandatory conclusion 'Jadi, jawaban yang benar adalah...'!")

                        self._check_option_letter_leak(sol, f"{prefix} -> solution[{idx}]")

        # 6. Variable Formulas
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

            # Validate children blocks recursively
            children = block.get("children", [])
            if isinstance(children, list) and children:
                self._validate_block_list(children, f"{location}[{idx}] -> children")

    def _validate_option_block(self, opt: dict, location: str):
        if not isinstance(opt, dict):
            self.errors.append(f"{location}: Option must be a block object.")
            return

        btype = opt.get("type")
        if btype == "equation":
            self.errors.append(f"{location}: Option uses 'equation' block! Options MUST use 'paragraph' + inline latex to prevent UI layout breakage.")

    def _validate_variable_formulas(self, vf: dict, location: str):
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
                    self.errors.append(f"{location}.solutions['{var_name}']: Formula '{formula}' contains mustache braces '{{...}}'. Use bare variable names.")

    def _check_option_letter_leak(self, sol: dict, location: str):
        sol_str = json.dumps(sol, ensure_ascii=False)
        pattern = r"\b(opsi|jawaban)\s+([A-Ea-e])\b"
        matches = re.findall(pattern, sol_str)
        if matches:
            self.warnings.append(f"{location}: Solution references option letters {matches}. Option positions are randomized in database!")


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
        files_to_check = list(target_path.glob("**/*.json"))

    if not files_to_check:
        print(f"{YELLOW}No .json files found in '{target_path}'.{RESET}")
        sys.exit(0)

    print(f"{BLUE}🔍 Validating {len(files_to_check)} JSON question file(s)...{RESET}\n")

    validator = QuestionValidator()
    passed_count = 0
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
            passed_count += 1
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
    print(f"Failed        : {RED}{failed_count}{RESET}")
    print("=" * 50)

    if failed_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
