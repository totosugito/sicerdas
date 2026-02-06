"""
Script to renumber books, update page/size information, and optionally organize PDF files.

This script performs the following operations:
1. Reads a list of books from a JSON input.
2. Locates the corresponding PDF files in two specified directories (Directory A and Directory B).
3. Selects the smallest PDF file if it exists in both directories.
4. Calculates the file size and page count (using pypdf or regex fallback).
5. Renumbers the book IDs sequentially starting from a given integer.
6. Generates a unique 'cloudFile' name based on the new ID and a hash.
7. Outputs the updated book list to a JSON file.
8. (Optional) Copies the selected smallest PDF to a specified output directory with the new 'cloudFile' name.
9. (Optional) Exports specific book data to a CSV file.

Usage:
    python process/step_2_renumber.py --dir_a <path_to_dir_a> --dir_b <path_to_dir_b> --input <input_json> [--output <output_json>] [--start_id <start_id>] [--output_dir <output_dir> --process] [--output_csv <output_csv>]
"""

import argparse
import json
import os
import shutil
import csv
import urllib.parse
import re
from typing import List, Dict, Any, Optional
import hashlib

# Attempt to import PDF libraries for page counting
HAS_PDF_LIB = False
try:
    import pypdf
    HAS_PDF_LIB = True
    PDF_LIB = "pypdf"
except ImportError:
    pass

def get_filename_from_url(url: Optional[str]) -> str:
    """Extracts and decodes the filename from a URL."""
    if not url:
        return ""
    parsed = urllib.parse.urlparse(url)
    filename = os.path.basename(parsed.path)
    return urllib.parse.unquote(filename)

def get_pdf_page_count(filepath: str) -> int:
    """
    Returns the number of pages in a PDF file.
    Uses pypdf if available, otherwise falls back to a regex approximation.
    """
    if HAS_PDF_LIB:
        try:
            with open(filepath, 'rb') as f:
                reader = pypdf.PdfReader(f)
                if reader.is_encrypted:
                    try:
                        reader.decrypt("")
                    except:
                        pass
                # Some versions use len(reader.pages), others reader.numPages or len(reader.pages)
                if hasattr(reader, 'pages'):
                     return len(reader.pages)
                else:
                     return reader.numPages
        except Exception as e:
            # print(f"Warning: Failed to count pages with {PDF_LIB} for {filepath}: {e}")
            pass
            
    # Fallback: Regex approximation
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
            # Look for /Type /Page
            return len(re.findall(br"/Type\s*/Page\b", content))
    except Exception:
        return 0

def process_books(dir_a: str, dir_b: str, input_file: str, output_file: str, start_id: int, output_dir: Optional[str] = None, process: bool = False, output_csv: Optional[str] = None) -> None:
    print(f"Reading input from: {input_file}")
    
    if not os.path.exists(input_file):
        print(f"Error: Input file not found: {input_file}")
        return

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            books: List[Dict[str, Any]] = json.load(f)
    except Exception as e:
        print(f"Error reading input file: {e}")
        return

    print(f"Checking folders:\n A: {dir_a}\n B: {dir_b}\n")
    
    processed_books: List[Dict[str, Any]] = []
    
    # Sort by existing ID to maintain relative order if possible
    # books.sort(key=lambda x: int(x.get('id', 0)) if str(x.get('id', 0)).isdigit() else 0)

    num_found: int = 0
    num_missing: int = 0
    next_id: int = start_id

    for book in books:
        attachment_url = book.get("attachment")
        filename = get_filename_from_url(attachment_url)
        
        if not filename:
            # Skip or keep? If we are renumbering a clean list, we might skip invalid ones.
            # But "output very like input" suggests keeping unless told otherwise.
            # However, we can't get size/page. 
            # Let's keep it but not update size/page (or set to 0).
            # AND increment ID?
            processed_books.append(book)
            # next_id += 1 # type: ignore
            num_missing += 1 # type: ignore
            continue

        path_a = os.path.join(dir_a, filename)
        path_b = os.path.join(dir_b, filename)
        
        stat_a = os.stat(path_a) if os.path.exists(path_a) else None
        stat_b = os.stat(path_b) if os.path.exists(path_b) else None
        
        size_a = stat_a.st_size if stat_a else None
        size_b = stat_b.st_size if stat_b else None
        
        selected_path = None
        selected_size = 0
        
        # Determine smallest / existing
        # Explicitly cast to int for comparison if not None, though logic guarantees it
        safe_size_a = size_a if size_a is not None else float('inf')
        safe_size_b = size_b if size_b is not None else float('inf')

        if stat_a and stat_b:
            if safe_size_a < safe_size_b:
                selected_path = path_a
                selected_size = size_a
            else:
                selected_path = path_b
                selected_size = size_b
        elif stat_a:
            selected_path = path_a
            selected_size = size_a
        elif stat_b:
            selected_path = path_b
            selected_size = size_b
            
        if selected_path:
            page_count = get_pdf_page_count(selected_path)
            
            # Update book info
            book['size'] = selected_size
            book['page'] = page_count
            book['bookId'] = next_id # Renumber
            
            key_id: str = hashlib.md5(str(next_id).encode('utf-8')).hexdigest()
            book['cloudFile'] = '%04d_%s.pdf' % (next_id, key_id[:4])

            book['filename'] = filename
            
            if process and output_dir:
                 if os.path.exists(output_dir):
                    dest_path = os.path.join(output_dir, book['cloudFile'])
                    try:
                        shutil.copy2(selected_path, dest_path)
                        # print(f"Copied to {dest_path}")
                    except Exception as e:
                        print(f"Error copying file {filename} to {dest_path}: {e}")
            
            processed_books.append(book)
            next_id += 1 # type: ignore
            num_found += 1 # type: ignore
            
            # Optional logging
            # print(f"{next_id-1}: {filename} (Size: {selected_size}, Pages: {page_count})")
        else:
            # File missing
            print(f"Missing: {filename}")
            # Keep with default/old values or skip?
            # Assuming we keep it to be "like input", but renumbered.
            # book['bookId'] = next_id
            book['filename'] = filename
            book['size'] = 0
            book['page'] = 0
            processed_books.append(book)
            # next_id += 1 # type: ignore
            num_missing += 1 # type: ignore

    print("-" * 60)
    print(f"Writing output to: {output_file}")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(processed_books, f, indent=2, ensure_ascii=False)
            
        print(f"Total processed: {len(processed_books)}")
        print(f"Total processed: {len(processed_books)}")
        print(f"Found & Updated: {num_found}")
        print(f"Missing: {num_missing}")
        print("Done.")

    except Exception as e:
        print(f"Error writing output file: {e}")

    if output_csv:
        print(f"Writing CSV output to: {output_csv}")
        try:
            with open(output_csv, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['bookId', 'versionId', 'groupId', 'educationId', 'title', 'author', 'year', 'pages', 'size']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for book in processed_books:
                    row = {
                        'bookId': book.get('bookId'),
                        'versionId': 2,
                        'groupId': -1,
                        'educationId': book.get('class', ""),
                        'title': book.get('title', ""),
                        'author': book.get('writer', ""),
                        'year': book.get('curriculum', ""),
                        'pages': book.get('page', 0), # Using calculated page (key 'page') mapping to CSV 'pages'
                        'size': book.get('size', 0)
                    }
                    writer.writerow(row)
            print(f"CSV output written successfully.")
        except Exception as e:
            print(f"Error writing CSV file: {e}")

def main():
    parser = argparse.ArgumentParser(description="Renumber books and update PDF metadata.")
    parser.add_argument("--dir_a", required=True, help="Path to the first directory (Directory A)")
    parser.add_argument("--dir_b", required=True, help="Path to the second directory (Directory B)")
    parser.add_argument("--input", required=True, help="Path to the input JSON file")
    parser.add_argument("--output", default="renumbered_books.json", help="Path to the output JSON file")
    parser.add_argument("--start_id", type=int, default=1, help="Starting number for bookId (default: 1)")
    parser.add_argument("--output_dir", help="Directory to save processed PDF files")
    parser.add_argument("--process", action="store_true", default=False, help="If set, copy smallest PDF to output_dir with new name")
    parser.add_argument("--output_csv", help="Path to the output CSV file")

    args = parser.parse_args()

    if args.process and not args.output_dir:
        parser.error("--process requires --output_dir to be specified.")

    if args.output_dir and not os.path.exists(args.output_dir):
        try:
             os.makedirs(args.output_dir)
             print(f"Created output directory: {args.output_dir}")
        except OSError as e:
             print(f"Error creating output directory {args.output_dir}: {e}")
             return

    process_books(args.dir_a, args.dir_b, args.input, args.output, args.start_id, args.output_dir, args.process, args.output_csv)

if __name__ == "__main__":
    main()
