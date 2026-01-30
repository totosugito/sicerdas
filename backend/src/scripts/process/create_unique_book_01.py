"""
Script to create a unique book list from multiple JSON data files.

This program reads all JSON files from the data directory, extracts unique books 
by their ID field, sorts them in ascending order by ID, and saves the result 
to a new JSON file named 'unique_books.json'.

The script automatically ignores the output file when processing to avoid 
including previously generated results in the new output.

Author: Qwen
Date: 2025-10-06
"""

import json
import os
from pathlib import Path

def read_json_files(data_dir, output_filename):
    """
    Read all JSON files in the data directory (except the output file) 
    and return a list of all books.
    """
    all_books = []
    
    # Get all JSON files in the data directory
    json_files = list(Path(data_dir).glob("*.json"))
    
    # Filter out the output file
    json_files = [f for f in json_files if f.name != output_filename]
    
    print(f"Found {len(json_files)} JSON files (excluding output file)")
    
    # Read each JSON file
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                books = json.load(f)
                print(f"Loaded {len(books)} books from {json_file.name}")
                all_books.extend(books)
        except Exception as e:
            print(f"Error reading {json_file}: {e}")
    
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
    # Define paths
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / "data"
    output_filename = "unique_books_251006.json"
    output_file = data_dir / output_filename
    
    print(f"Script directory: {script_dir}")
    print(f"Data directory: {data_dir}")
    print(f"Output file: {output_file}")
    
    # Check if data directory exists
    if not data_dir.exists():
        print(f"Error: Data directory {data_dir} does not exist")
        return
    
    # Read all JSON files (excluding the output file)
    all_books = read_json_files(data_dir, output_filename)
    
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