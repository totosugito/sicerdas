import json
import sqlite3
import argparse
from pathlib import Path

def convert_json_to_sqlite(json_path: Path, sqlite_path: Path):
    """
    Reads the dictionary JSON file and creates a SQLite database with FTS5.
    """
    print(f"Reading JSON from {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        entries = json.load(f)
    
    print(f"Loaded {len(entries)} entries. Initializing SQLite database at {sqlite_path}...")
    
    # Ensure parent directory exists
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Remove existing database if it exists
    if sqlite_path.exists():
        sqlite_path.unlink()
        
    conn = sqlite3.connect(sqlite_path)
    cursor = conn.cursor()
    
    # Optimize SQLite for speed during writes
    cursor.execute("PRAGMA journal_mode = OFF;")
    cursor.execute("PRAGMA synchronous = OFF;")
    cursor.execute("PRAGMA temp_store = MEMORY;")
    
    # Create words table
    cursor.execute("""
    CREATE TABLE words (
        dict_id INTEGER PRIMARY KEY,
        word TEXT NOT NULL,
        meaning TEXT NOT NULL,
        mode INTEGER NOT NULL,
        dict_swap BOOLEAN NOT NULL DEFAULT 0
    );
    """)
    
    # Create favorites table
    cursor.execute("""
    CREATE TABLE favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dict_id INTEGER NOT NULL,
        mode INTEGER NOT NULL,
        FOREIGN KEY(dict_id) REFERENCES words(dict_id) ON DELETE CASCADE
    );
    """)
    
    # Create words FTS5 virtual table using content/external content options to save space
    cursor.execute("""
    CREATE VIRTUAL TABLE words_fts USING fts5(
        word,
        content='words',
        content_rowid='dict_id'
    );
    """)
    
    # Create triggers to sync FTS5 table with the words table automatically
    cursor.execute("""
    CREATE TRIGGER words_ai AFTER INSERT ON words BEGIN
      INSERT INTO words_fts(rowid, word) VALUES (new.dict_id, new.word);
    END;
    """)
    
    cursor.execute("""
    CREATE TRIGGER words_ad AFTER DELETE ON words BEGIN
      INSERT INTO words_fts(words_fts, rowid, word) VALUES('delete', old.dict_id, old.word);
    END;
    """)
    
    cursor.execute("""
    CREATE TRIGGER words_au AFTER UPDATE ON words BEGIN
      INSERT INTO words_fts(words_fts, rowid, word) VALUES('delete', old.dict_id, old.word);
      INSERT INTO words_fts(rowid, word) VALUES (new.dict_id, new.word);
    END;
    """)
    
    # Insert data in batches
    print("Inserting data into words table...")
    batch_size = 5000
    batch = []
    
    for entry in entries:
        dict_id = entry.get("dictId")
        word = entry.get("dictWord", "")
        meaning = entry.get("dictMeaning", "")
        # Handle dictMode which could be string/int, e.g., "10" or 10
        mode_raw = entry.get("dictMode", 0)
        try:
            mode = int(mode_raw)
        except ValueError:
            mode = 0
            
        dict_swap = 1 if entry.get("dictSwap") is True else 0
        
        batch.append((dict_id, word, meaning, mode, dict_swap))
        
        if len(batch) >= batch_size:
            cursor.executemany(
                "INSERT INTO words (dict_id, word, meaning, mode, dict_swap) VALUES (?, ?, ?, ?, ?);",
                batch
            )
            batch = []
            
    if batch:
        cursor.executemany(
            "INSERT INTO words (dict_id, word, meaning, mode, dict_swap) VALUES (?, ?, ?, ?, ?);",
            batch
        )
        
    conn.commit()
    
    # Run optimize on FTS5 table to compress/optimize index structure
    print("Optimizing FTS5 index...")
    cursor.execute("INSERT INTO words_fts(words_fts) VALUES('optimize');")
    conn.commit()
    
    # Verification count check
    cursor.execute("SELECT COUNT(*) FROM words;")
    words_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM words_fts;")
    fts_count = cursor.fetchone()[0]
    
    print(f"Successfully converted. Created database at {sqlite_path}")
    print(f"Words Count: {words_count}")
    print(f"FTS Index Count: {fts_count}")
    
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert Dictionary JSON to SQLite FTS5")
    parser.add_argument("--json", type=str, default="d:/React/sicerdas/test/003_id_en_01_50F2.json", help="Path to input JSON file")
    parser.add_argument("--sqlite", type=str, default="d:/React/sicerdas/test/003_id_en_01_50F2.db", help="Path to output SQLite file")
    # python convert_json_to_sqlite.py --json d:/React/sicerdas/test/004_kb_kb_01_eb22.json --sqlite d:/React/sicerdas/test/004_kb_kb_01_eb22.db
    args = parser.parse_args()
    
    json_file = Path(args.json)
    sqlite_file = Path(args.sqlite)
    
    convert_json_to_sqlite(json_file, sqlite_file)
