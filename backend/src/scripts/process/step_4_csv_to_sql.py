"""
Script to convert Book CSV data to SQL INSERT statements.

This script reads a CSV file with book data and generates a SQL file containing
INSERT statements for the `books` table.

Expected CSV columns:
bookId,versionId,groupId,educationId,title,author,year,pages,size,Status

Usage:
    python process/step_4_csv_to_sql.py data/books.csv -o data/books_insert.sql
"""

import csv
import argparse
from pathlib import Path
import sys

def escape_sql_string(value):
    """
    Escape single quotes for SQL string literals.
    Returns the value wrapped in single quotes, or NULL.
    """
    if value is None:
        return "NULL"
    
    # Convert to string and escape single quotes by doubling them
    val_str = str(value).replace("'", "''")
    return f"'{val_str}'"

def get_status_enum(status_code):
    """
    Map CSV Status code to EnumContentStatus string.
    Maps '1' -> 'published'
    Maps '0' -> 'archived'
    Default -> 'unpublished'
    """
    val = str(status_code).strip()
    if val == "1":
        return "'published'"
    if val == "0":
        return "'archived'"
    return "'unpublished'"

def process_csv_to_sql(input_file, output_file):
    """
    Read CSV file and generate SQL insert statements.
    """
    input_path = Path(input_file)
    output_path = Path(output_file)
    
    if not input_path.exists():
        print(f"Error: Input file {input_path} not found.")
        sys.exit(1)

    print(f"Reading CSV: {input_path}")
    
    sql_statements = []
    
    try:
        with open(input_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
            # properly handle BOM if present with utf-8-sig
            reader = csv.DictReader(f)
            
            # Verify headers
            expected_headers = {
                'bookId', 'versionId', 'groupId', 'educationId', 
                'title', 'author', 'year', 'pages', 'size', 'Status'
            }
            
            if reader.fieldnames:
                headers = set(reader.fieldnames)
                missing = expected_headers - headers
                if missing and not any(h.strip() in expected_headers for h in headers): 
                    # Loose check if headers are completely wrong
                    print(f"Warning: Missing expected headers: {missing}")
                    print(f"Found headers: {reader.fieldnames}")

            count = 0
            for row_num, row in enumerate(reader, start=1):
                try:
                    # Extract and validate fields
                    book_id = int(row['bookId'])
                    version_id = int(row['versionId'])
                    book_group_id = int(row['groupId'])
                    education_grade_id = int(row['educationId'])
                    
                    # Text fields
                    title = row['title']
                    author = row['author']
                    published_year = row['year']
                    
                    # Numeric fields
                    total_pages = int(row['pages'])
                    size = int(row['size'])
                    
                    # Status
                    status_raw = row['Status']
                    
                    # Format for SQL
                    status_sql = get_status_enum(status_raw)
                    title_sql = escape_sql_string(title)
                    author_sql = escape_sql_string(author)
                    year_sql = escape_sql_string(published_year)
                    
                    # Construct INSERT statement
                    # Table: books
                    # Columns from schema: 
                    # book_id, version_id, book_group_id, education_grade_id
                    # title, author, published_year, total_pages, size, status
                    
                    sql = (
                        f"INSERT INTO books ("
                        f"book_id, version_id, book_group_id, education_grade_id, "
                        f"title, author, published_year, total_pages, size, status"
                        f") VALUES ("
                        f"{book_id}, {version_id}, {book_group_id}, {education_grade_id}, "
                        f"{title_sql}, {author_sql}, {year_sql}, {total_pages}, {size}, {status_sql}"
                        f");"
                    )
                    
                    sql_statements.append(sql)
                    count += 1
                    
                except (ValueError, KeyError) as e:
                    print(f"Error on row {row_num}: {e}")
                    print(f"Row data: {row}")
                    continue

            print(f"Processed {count} rows successfully.")
            
            # Write to output file
            # Ensure output directory exists
            if output_path.parent and not output_path.parent.exists():
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
            with open(output_path, 'w', encoding='utf-8') as f_out:
                f_out.write("-- SQL Insert Statements for books table\n")
                f_out.write(f"-- Generated from {input_path.name}\n\n")
                f_out.write("\n".join(sql_statements))
                f_out.write("\n")
                
            print(f"SQL file created: {output_path}")
            
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Convert Books CSV to SQL Insert Statements.")
    parser.add_argument("input_file", help="Path to input CSV file")
    parser.add_argument("-o", "--output", help="Path to output SQL file", default="books_insert.sql")
    
    args = parser.parse_args()
    
    process_csv_to_sql(args.input_file, args.output)

if __name__ == "__main__":
    main()
