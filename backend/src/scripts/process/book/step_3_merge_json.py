"""
Script to create a unique book list from provided JSON data files.

This program reads JSON files provided via command line arguments, extracts unique books 
by their ID and ISBN fields, sorts them in ascending order by ID, and saves 
the result to a new JSON file.

Usage:
    python process/step_3_merge_json.py data/file1.json data/file2.json -o result.json
    python process/step_3_merge_json.py data/*.json
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Any

def read_json_files(file_paths):
    """
    Read valid JSON files from the provided list and return a list of all books.
    """
    all_books = []
    
    print(f"Processing {len(file_paths)} input files...")
    
    for file_path_str in file_paths:
        file_path = Path(file_path_str)
        if not file_path.exists():
            print(f"Warning: File {file_path} does not exist. Skipping.")
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                books = json.load(f)
                if isinstance(books, list):
                    print(f"Loaded {len(books)} books from {file_path.name}")
                    all_books.extend(books)
                else:
                    print(f"Warning: Content of {file_path.name} is not a list. Skipping.")
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    return all_books

def get_unique_books(books):
    """
    Filter books to get unique entries by ID and ISBN.
    Returns a tuple of (unique_books, duplicate_books).
    """
    unique_books: List[Dict[str, Any]] = []
    duplicate_books: List[Dict[str, Any]] = []
    seen_ids = set()
    seen_isbn_configs = set()
    
    for book in books:
        # Ensure isbn key exists
        if 'isbn' not in book:
            book['isbn'] = ""
            
        book_id = book.get('id')
        isbn = book.get('isbn')
        class_key = book.get('class', '')
        attachment = book.get('attachment')
        
        if not attachment:
            duplicate_books.append({**book, "reason": "empty_attachment"})
            continue
        
        # Extract filename from attachment URL
        attachment_filename = Path(attachment).name
        
        # Clean ISBN and Class for comparison
        clean_isbn = str(isbn).strip() if isbn else ""
        clean_class = str(class_key).strip()
        isbn_config = (clean_isbn, clean_class, attachment_filename)
        
        # Check uniqueness: duplicate if ID seen OR ISBN seen (if not empty)
        duplicate_reason = ""
        if book_id and book_id in seen_ids:
            duplicate_reason = f"duplicate_id:{book_id}"
        elif clean_isbn and isbn_config in seen_isbn_configs:
            duplicate_reason = f"duplicate_isbn_class_file:{clean_isbn}:{clean_class}:{attachment_filename}"
            
        if not duplicate_reason:
            unique_books.append(book)
            if book_id:
                seen_ids.add(book_id)
            if clean_isbn:
                seen_isbn_configs.add(isbn_config)
        else:
            duplicate_books.append({**book, "reason": duplicate_reason})
    
    return unique_books, duplicate_books

def save_json(data, output_file, description="records"):
    """
    Save list of books/data to a JSON file.
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(data)} {description} to {output_file}")
    except Exception as e:
        print(f"Error saving to {output_file}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Create unique book list from JSON file(s).")
    parser.add_argument("input_files", nargs='+', help="Path to input JSON file(s)")
    parser.add_argument("-o", "--output", help="Path to output JSON file", default="unique_books.json")
    parser.add_argument("-d", "--duplicates", help="Path to duplicates JSON file", default="duplicate_books.json")
    
    args = parser.parse_args()
    
    input_files = args.input_files
    output_file = Path(args.output)
    dup_output_file = Path(args.duplicates)
    
    print(f"Unique output: {output_file}")
    print(f"Duplicates output: {dup_output_file}")
    
    # Read all JSON files
    all_books = read_json_files(input_files)
    
    print(f"Total books found: {len(all_books)}")
    
    # Get unique and duplicate books
    unique_books, duplicate_books = get_unique_books(all_books)
    
    # Sort both lists by ID
    unique_books.sort(key=lambda book: book.get('id', 0))
    duplicate_books.sort(key=lambda book: book.get('id', 0))
    
    # Save unique books to file
    save_json(unique_books, output_file, "unique books")
    
    # Save duplicate books to file
    save_json(duplicate_books, dup_output_file, "duplicate books")

if __name__ == "__main__":
    main()