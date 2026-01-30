"""
Script to identify new books that are not present in an existing unique book list.

This program:
1. Reads a unique book list from a JSON file
2. Reads a new book list from another JSON file
3. Compares the two lists by book ID
4. Identifies books in the new list that aren't in the unique list
5. Saves those new books to an output JSON file using the same key structure as the unique books file

Author: Qwen
Date: 2025-10-06
"""

import json
import sys
from pathlib import Path

# Define the keys that should be included in the output file (same as unique books file)
UNIQUE_BOOK_KEYS = [
    "title", "id", "attachment", "filename", "class", "level", "writer", 
    "reviewer", "translator", "designer", "cover_designer", "ilustrator", 
    "editor", "publisher", "isbn", "curriculum", "edition", "book_type", 
    "cloud", "size", "page"
]

def load_books_from_file(file_path):
    """
    Load books from a JSON file.
    
    Args:
        file_path (str): Path to the JSON file
        
    Returns:
        list: List of book dictionaries
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            books = json.load(f)
        print(f"Loaded {len(books)} books from {file_path}")
        return books
    except Exception as e:
        print(f"Error loading books from {file_path}: {e}")
        return []

def get_book_ids(books):
    """
    Extract book IDs from a list of books.
    
    Args:
        books (list): List of book dictionaries
        
    Returns:
        set: Set of book IDs
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

def filter_book_keys(book, keys):
    """
    Filter a book dictionary to only include specified keys.
    
    Args:
        book (dict): Book dictionary
        keys (list): List of keys to include
        
    Returns:
        dict: Book dictionary with only the specified keys
    """
    filtered_book = {}
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

def find_new_books(unique_books, new_books):
    """
    Find books in new_books that are not present in unique_books.
    
    Args:
        unique_books (list): List of existing unique books
        new_books (list): List of new books to check
        
    Returns:
        list: List of books that are new (not in unique_books) with filtered keys
    """
    unique_ids = get_book_ids(unique_books)
    new_book_list = []
    
    for book in new_books:
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

def save_books_to_file(books, output_file):
    """
    Save books to a JSON file.
    
    Args:
        books (list): List of book dictionaries
        output_file (str): Path to the output file
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(books, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(books)} books to {output_file}")
    except Exception as e:
        print(f"Error saving books to {output_file}: {e}")

def save_attachment_urls(books, output_file):
    """
    Save attachment URLs from books to a text file, one URL per line.
    
    Args:
        books (list): List of book dictionaries
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

def main(unique_books_file, new_books_file, output_file):
    """
    Main function to process the books.
    
    Args:
        unique_books_file (str): Path to the unique books JSON file
        new_books_file (str): Path to the new books JSON file
        output_file (str): Path to the output JSON file
    """
    print("Starting book comparison process...")
    print(f"Unique books file: {unique_books_file}")
    print(f"New books file: {new_books_file}")
    print(f"Output file: {output_file}")
    
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
    new_unique_books = find_new_books(unique_books, new_books)
    
    # Sort the new books by ID in ascending order
    try:
        new_unique_books.sort(key=lambda book: int(book.get('id', 0)))
    except (ValueError, TypeError):
        # If ID is not convertible to int, sort as strings
        new_unique_books.sort(key=lambda book: str(book.get('id', '')))
    
    print(f"Found {len(new_unique_books)} new books not in the unique list")
    
    # Save the new books
    if new_unique_books:
        save_books_to_file(new_unique_books, output_file)
        # Save attachment URLs to a separate text file
        save_attachment_urls(new_unique_books, output_file)
        print("Process completed successfully.")
    else:
        print("No new books found.")
        # Create an empty array file
        save_books_to_file([], output_file)
        # Create an empty URLs file
        save_attachment_urls([], output_file)

if __name__ == "__main__":
    # Check if the correct number of arguments are provided
    if len(sys.argv) != 4:
        print("Usage: python create_new_book_02.py <unique_books_file> <new_books_file> <output_file>")
        print("Example: python create_new_book_02.py unique_books_251006.json new_books.json new_books_output.json")
        sys.exit(1)
    
    # Get file paths from command line arguments
    unique_books_file = sys.argv[1]
    new_books_file = sys.argv[2]
    output_file = sys.argv[3]
    
    # Run the main process
    main(unique_books_file, new_books_file, output_file)