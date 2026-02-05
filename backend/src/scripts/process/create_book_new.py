"""
Script to identify new books that are not present in an existing unique book list.

This program:
1. Reads a unique book list from a JSON file
2. Reads a new book list from another JSON file
3. Compares the two lists by book ID
4. Identifies books in the new list that aren't in the unique list
5. Saves those new books to an output JSON file using the same key structure as the unique books file

Usage:
    python backend/src/scripts/process/create_book_new.py -u unique_books.json -n new_books.json -o output.json
    python backend/src/scripts/process/create_book_new.py -u unique_books.json -n new_books.json -o output.json -e "Edition 1" "Old Edition" "2013 Curriculum"
"""

import json
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Set, Any, Optional

# Define the keys that should be included in the output file (same as unique books file)
UNIQUE_BOOK_KEYS = [
    "title", "id", "attachment", "filename", "class", "level", "writer", 
    "reviewer", "translator", "designer", "cover_designer", "ilustrator", 
    "editor", "publisher", "isbn", "curriculum", "edition", "book_type", 
    "cloud", "size", "page"
]

def load_books_from_file(file_path: Path) -> List[Dict[str, Any]]:
    """
    Load books from a JSON file.
    
    Args:
        file_path (Path): Path to the JSON file
        
    Returns:
        List[Dict[str, Any]]: List of book dictionaries
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            books = json.load(f)
        print(f"Loaded {len(books)} books from {file_path}")
        return books
    except Exception as e:
        print(f"Error loading books from {file_path}: {e}")
        return []

def get_book_ids(books: List[Dict[str, Any]]) -> Set[Any]:
    """
    Extract book IDs from a list of books.
    
    Args:
        books (List[Dict[str, Any]]): List of book dictionaries
        
    Returns:
        Set[Any]: Set of book IDs
    """
    ids = set()
    for book in books:
        book_id = book.get('id')
        if book_id is not None:
            # Convert to integer if possible for consistent comparison
            try:
                ids.add(int(book_id))
            except (ValueError, TypeError):
                ids.add(book_id)
    return ids

def filter_book_keys(book: Dict[str, Any], keys: List[str]) -> Dict[str, Any]:
    """
    Filter a book dictionary to only include specified keys.
    
    Args:
        book (Dict[str, Any]): Book dictionary
        keys (List[str]): List of keys to include
        
    Returns:
        Dict[str, Any]: Book dictionary with only the specified keys
    """
    filtered_book: Dict[str, Any] = {}
    for key in keys:
        if key in book:
            # Special handling for ID to ensure it's an integer
            if key == "id":
                try:
                    filtered_book[key] = int(book[key])
                except (ValueError, TypeError):
                    filtered_book[key] = book[key]
            else:
                filtered_book[key] = book[key]
        else:
            # Add empty string for missing keys to maintain consistency
            # Special handling for numeric fields
            if key in ["size", "page"]:
                filtered_book[key] = 0
            else:
                filtered_book[key] = ""
    return filtered_book

def find_new_books(unique_books: List[Dict[str, Any]], new_books: List[Dict[str, Any]], excluded_values: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """
    Find books in new_books that are not present in unique_books.
    Also filters out books with editions or curriculums present in excluded_values.
    
    Args:
        unique_books (List[Dict[str, Any]]): List of existing unique books
        new_books (List[Dict[str, Any]]): List of new books to check
        excluded_values (Optional[List[str]]): List of editions or curriculums to exclude
        
    Returns:
        List[Dict[str, Any]]: List of books that are new (not in unique_books) with filtered keys
    """
    unique_ids = get_book_ids(unique_books)
    new_book_list = []
    
    # Normalize excluded values for comparison if provided
    excluded_set: Set[str] = set(excluded_values or [])
    
    for book in new_books:
        attachment = book.get('attachment')
        if attachment == "":
            continue
        
        # Check if book edition or curriculum is in the excluded list
        if excluded_set:
            book_edition = book.get('edition')
            book_curriculum = book.get('curriculum')
            
            # Check edition
            if book_edition is not None and str(book_edition) in excluded_set:
                continue
                
            # Check curriculum
            if book_curriculum is not None and str(book_curriculum) in excluded_set:
                continue

        book_id = book.get('id')
        if book_id is not None:
            # Convert to integer if possible for consistent comparison
            try:
                book_id = int(book_id)
            except (ValueError, TypeError):
                pass  # Keep as original if conversion fails
            
            if book_id not in unique_ids:
                # Filter the book to only include keys from the unique books structure
                filtered_book = filter_book_keys(book, UNIQUE_BOOK_KEYS)
                new_book_list.append(filtered_book)
    
    return new_book_list

def save_books_to_file(books: List[Dict[str, Any]], output_file: str):
    """
    Save books to a JSON file.
    
    Args:
        books (List[Dict[str, Any]]): List of book dictionaries
        output_file (str): Path to the output file
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(books, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(books)} books to {output_file}")
    except Exception as e:
        print(f"Error saving books to {output_file}: {e}")

def save_attachment_urls(books: List[Dict[str, Any]], output_file: str):
    """
    Save attachment URLs from books to a text file, one URL per line.
    
    Args:
        books (List[Dict[str, Any]]): List of book dictionaries
        output_file (str): Path to the output text file
    """
    try:
        # Generate text file path by replacing .json extension with .txt
        base_name = output_file.rsplit('.', 1)[0] if '.' in output_file else output_file
        urls_file = f"{base_name}_urls.txt"
        
        with open(urls_file, 'w', encoding='utf-8') as f:
            for book in books:
                attachment = book.get('attachment', '')
                if attachment:
                    f.write(f"{attachment}\n")
        
        print(f"Saved {len(books)} attachment URLs to {urls_file}")
    except Exception as e:
        print(f"Error saving attachment URLs to file: {e}")

def main():
    parser = argparse.ArgumentParser(description="Identify new books that are not present in an existing unique book list.")
    parser.add_argument("-u", "--unique_books_file", required=True, help="Path to the existing unique books JSON file")
    parser.add_argument("-n", "--new_books_file", required=True, help="Path to the new books JSON file")
    parser.add_argument("-o", "--output_file", required=True, help="Path to the output JSON file")
    parser.add_argument("-e", "--exclude", nargs='*', help="List of editions or curriculums to exclude", default=[])
    
    args = parser.parse_args()
    
    unique_books_file = Path(args.unique_books_file)
    new_books_file = Path(args.new_books_file)
    output_file = Path(args.output_file)
    excluded_values = args.exclude
    
    print("Starting book comparison process...")
    print(f"Unique books file: {unique_books_file}")
    print(f"New books file: {new_books_file}")
    print(f"Output file: {output_file}")
    if excluded_values:
        print(f"Excluding values: {excluded_values}")
    
    # Check if input files exist
    if not unique_books_file.exists():
        print(f"Error: Unique books file '{unique_books_file}' does not exist.")
        return
    if not new_books_file.exists():
        print(f"Error: New books file '{new_books_file}' does not exist.")
        return

    # Load the unique books
    unique_books = load_books_from_file(unique_books_file)
    if not unique_books:
        print("No unique books loaded. Exiting.")
        return
    
    # Load the new books
    new_books = load_books_from_file(new_books_file)
    if not new_books:
        print("No new books loaded. Exiting.")
        return
    
    # Find new books
    new_unique_books = find_new_books(unique_books, new_books, excluded_values)
    
    # Sort the new books by ID in ascending order
    try:
        new_unique_books.sort(key=lambda book: int(book.get('id', 0)))
    except (ValueError, TypeError):
        # If ID is not convertible to int, sort as strings
        new_unique_books.sort(key=lambda book: str(book.get('id', '')))
    
    print(f"Found {len(new_unique_books)} new books not in the unique list")
    
    # Save the new books
    if new_unique_books:
        save_books_to_file(new_unique_books, str(output_file))
        # Save attachment URLs to a separate text file
        save_attachment_urls(new_unique_books, str(output_file))
        print("Process completed successfully.")
    else:
        print("No new books found.")
        # Create an empty array file
        save_books_to_file([], str(output_file))
        # Create an empty URLs file
        save_attachment_urls([], str(output_file))

if __name__ == "__main__":
    main()