"""
Script to create a unique book list from provided JSON data files.

This program reads JSON files provided via command line arguments, extracts unique books 
by their ID field, sorts them in ascending order by ID, and saves the result 
to a new JSON file.

Usage:
    python process/create_book_unique.py data/file1.json data/file2.json -o result.json
    python process/create_book_unique.py data/*.json
"""

import json
import argparse
from pathlib import Path

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

def get_unique_books_by_id(books):
    """
    Filter books to get unique entries by ID.
    If there are duplicates, keep the first occurrence.
    """
    unique_books = []
    seen_ids = set()
    
    for book in books:
        book_id = book.get('id')
        attachment = book.get('attachment')
        if attachment == "":
            continue
        
        if book_id and book_id not in seen_ids:
            unique_books.append(book)
            seen_ids.add(book_id)
    
    return unique_books

def save_unique_books(books, output_file):
    """
    Save the unique books to a JSON file.
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(books, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(books)} unique books to {output_file}")
    except Exception as e:
        print(f"Error saving to {output_file}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Create unique book list from JSON file(s).")
    parser.add_argument("input_files", nargs='+', help="Path to input JSON file(s)")
    parser.add_argument("-o", "--output", help="Path to output JSON file", default="unique_books.json")
    
    args = parser.parse_args()
    
    input_files = args.input_files
    output_file = Path(args.output)
    
    print(f"Output file: {output_file}")
    
    # Read all JSON files
    all_books = read_json_files(input_files)
    
    print(f"Total books found: {len(all_books)}")
    
    # Get unique books by ID
    unique_books = get_unique_books_by_id(all_books)
    
    # Sort the unique books by ID in ascending order
    unique_books.sort(key=lambda book: book.get('id', 0))
    
    print(f"Unique books: {len(unique_books)}")
    
    # Save unique books to file
    save_unique_books(unique_books, output_file)

if __name__ == "__main__":
    main()