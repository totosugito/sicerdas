"""
Script to compare and identify the smallest PDF files from two directories based on a JSON input.

This code for TESTING for the input to compare the size of the pdf files and show the log.

This script reads a JSON file containing book records with attachment URLs. It processes each record to:
1. Extract the filename from the attachment URL.
2. Check for the existence of the file in two specified directories (A and B).
3. Compare the file sizes if found in both directories to identify the smallest one.
4. Generate a log JSON file categorized by "found" and "notFound" files, including details
   on file sizes and which source contained the smallest version.

Usage:
    python process/step_1_smallest_pdf.py --dir_a <path_to_dir_a> --dir_b <path_to_dir_b> --input <input_json> [--output <output_json>]
"""

import argparse
import json
import os
import urllib.parse
from typing import List, Dict, Any, Optional

def get_filename_from_url(url: Optional[str]) -> str:
    """Extracts and decodes the filename from a URL."""
    if not url:
        return ""
    parsed = urllib.parse.urlparse(url)
    filename = os.path.basename(parsed.path)
    return urllib.parse.unquote(filename)


def process_pdfs(dir_a: str, dir_b: str, input_file: str, output_file: str):
    print(f"Reading input from: {input_file}")
    
    if not os.path.exists(input_file):
        print(f"Error: Input file not found: {input_file}")
        return

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading input file: {e}")
        return

    results_found = []
    results_not_found = []



    
    print(f"Checking folders:\n A: {dir_a}\n B: {dir_b}\n")
    print("-" * 60)
    print(f"{'FILENAME':<40} | {'STATUS':<10} | {'DETAILS'}")
    print("-" * 60)

    for item in data:
        attachment_url = item.get("attachment")
        title = item.get("title", "Unknown Title")
        item_id = item.get("id")
        
        filename = get_filename_from_url(attachment_url)
        
        if not filename:
            # print(f"[SKIP] ID {item_id}: No valid filename found.")
            results_not_found.append({
                "id": item_id,
                "title": title,
                "error": "Invalid attachment URL"
            })

            continue

        path_a = os.path.join(dir_a, filename)
        path_b = os.path.join(dir_b, filename)
        
        stat_a = os.stat(path_a) if os.path.exists(path_a) else None
        stat_b = os.stat(path_b) if os.path.exists(path_b) else None

        size_a = stat_a.st_size if stat_a else None
        size_b = stat_b.st_size if stat_b else None
        
        log_entry = {
            "id": item_id,
            "title": title,
            "filename": filename,
            "found_in_a": bool(stat_a),
            "size_a": size_a,
            "found_in_b": bool(stat_b),
            "size_b": size_b,
            "smallest_file": None,
            "smallest_size": None
        }

        status = None


        if not stat_a and not stat_b:
            print(f"{filename} | MISSING    | Not found in A or B")
            status = "missing"

        else:
            # Determine smallest
            if stat_a and stat_b:
                # Use infinity for comparison if size is None to avoid TypeError
                comp_a = size_a if size_a is not None else float('inf')
                comp_b = size_b if size_b is not None else float('inf')

                if comp_a < comp_b:
                    selected = ("A", size_a, path_a)
                else:
                    selected = ("B", size_b, path_b)
            elif stat_a:
                selected = ("A", size_a, path_a)
            else:
                selected = ("B", size_b, path_b)
            
            log_entry["smallest_file"] = selected[0]
            log_entry["smallest_size"] = selected[1]
            status = "found"
            
            print(f"{filename} | FOUND      | Smallest: {selected[0]} ({selected[1]} bytes)")


        if status == "found":
            results_found.append(log_entry)
        else:
            results_not_found.append(log_entry)



    print("-" * 60)
    print(f"Writing log to: {output_file}")
    
    try:
        output_data = {
            "found": results_found,
            "notFound": results_not_found
        }
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        all_results = results_found + results_not_found
        total_a = sum(1 for r in all_results if r.get("found_in_a"))
        total_b = sum(1 for r in all_results if r.get("found_in_b"))
        smallest_a = sum(1 for r in results_found if r.get("smallest_file") == "A")
        smallest_b = sum(1 for r in results_found if r.get("smallest_file") == "B")

        print(f"Total processed: {len(results_found)} found, {len(results_not_found)} not found.")
        print(f"Total found in A: {total_a} (Smallest in {smallest_a})")
        print(f"Total found in B: {total_b} (Smallest in {smallest_b})")
        print("Done.")


    except Exception as e:
        print(f"Error writing output file: {e}")

def main():
    parser = argparse.ArgumentParser(description="Compare PDF sizes in two directories based on JSON input.")
    parser.add_argument("--dir_a", required=True, help="Path to the first directory (Directory A)")
    parser.add_argument("--dir_b", required=True, help="Path to the second directory (Directory B)")
    parser.add_argument("--input", required=True, help="Path to the input JSON file")
    parser.add_argument("--output", default="process_log.json", help="Path to the output log JSON file")

    args = parser.parse_args()

    process_pdfs(args.dir_a, args.dir_b, args.input, args.output)

if __name__ == "__main__":
    main()

