import fs from 'fs';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/index.ts';
import { books, EnumDataStatus } from '../db/schema/index.ts';
import envConfig from '../config/env.config.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'development' ? '.env.devel' : '.env' });

// Type definition for the JSON book data
interface JsonBookData {
  BookId: number;
  grade: number; // Will be used directly as education_grade_id
  book_group: number; // Will be used directly as bookGroupId
  Judul: string;
  Pengarang: string;
  ExtraData: string | {
    dt: string;  // published year
    pg: number;  // total pages
    sz: number;  // size
  }; // Can be string (needs parsing) or object
  ItemHide: number; // 0 = published, 1 = archived
  [key: string]: any; // Allow for additional fields
}

async function importBooks() {
  const pool = new pg.Pool({
    connectionString: envConfig.db.url,
    max: 10,
  });

  try {
    const db = drizzle({ client: pool, schema });
    
    // Read and parse the JSON file
    const jsonFilePath = 'E:/Download/books.json';
    
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`JSON file not found at: ${jsonFilePath}`);
    }
    
    console.log('Reading books data from JSON file...');
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    if (!Array.isArray(jsonData)) {
      throw new Error('JSON file should contain an array of books');
    }
    
    console.log(`Found ${jsonData.length} books to import`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each book
    for (const [index, bookData] of jsonData.entries()) {
      try {
        const jsonBook = bookData as JsonBookData;
        if (!jsonBook.Pengarang) {
            jsonBook.Pengarang = '-'
        }
                
        // Validate required fields
        if (!jsonBook.BookId || !jsonBook.Judul || !jsonBook.Pengarang) {
          console.warn(`Skipping book at index ${index} - ${jsonBook.BookId}: Missing required fields (BookId, Judul, or Pengarang)`);
          errorCount++;
          continue;
        }
        
        // Validate grade field
        if (!jsonBook.grade) {
          console.warn(`Skipping book "${jsonBook.Judul}": Missing grade field`);
          errorCount++;
          continue;
        }
        
        // Validate book_group field
        if (!jsonBook.book_group) {
          console.warn(`Skipping book "${jsonBook.Judul}": Missing book_group field`);
          errorCount++;
          continue;
        }
        
        // Parse ExtraData if it's a string
        let extraData: { dt?: string; pg?: number; sz?: number } = {};
        try {
          if (typeof jsonBook.ExtraData === 'string') {
            extraData = JSON.parse(jsonBook.ExtraData);
          } else if (typeof jsonBook.ExtraData === 'object' && jsonBook.ExtraData !== null) {
            extraData = jsonBook.ExtraData;
          }
        } catch (parseError) {
          console.warn(`Warning: Failed to parse ExtraData for book "${jsonBook.Judul}" (BookId: ${jsonBook.BookId}):`, parseError);
          // Continue with empty extraData
        }
        
        // Map status
        const status = jsonBook.ItemHide === 1 ? EnumDataStatus.archived : EnumDataStatus.published;
        
        // Check if book already exists by bookId
        const existingBook = await db
          .select({ id: books.id })
          .from(books)
          .where(eq(books.bookId, jsonBook.BookId))
          .limit(1);
        
        const bookInsertData = {
          bookId: jsonBook.BookId, // Store original BookId in dedicated column
          versionId: 1, // Using version 1 as specified
          bookGroupId: jsonBook.book_group, // Use book_group directly from JSON as bookGroupId
          educationGradeId: jsonBook.grade, // Use grade directly from JSON as education_grade_id
          title: jsonBook.Judul,
          description: '', // Empty as specified in mapping
          author: jsonBook.Pengarang,
          publishedYear: extraData?.dt || '',
          totalPages: extraData?.pg || 0,
          size: extraData?.sz || 0,
          status
        };
        
        if (existingBook.length > 0) {
          // Update existing book
          await db
            .update(books)
            .set({
              ...bookInsertData,
              updatedAt: new Date()
            })
            .where(eq(books.id, existingBook[0].id));
          
        //   console.log(`Updated book: "${jsonBook.Judul}" (Original ID: ${jsonBook.BookId})`);
        } else {
          // Insert new book
          await db
            .insert(books)
            .values(bookInsertData);
          
        //   console.log(`Imported book: "${jsonBook.Judul}" (Original ID: ${jsonBook.BookId})`);
        }
        
        successCount++;
        
        // Progress indicator
        if ((index + 1) % 1000 === 0) {
          console.log(`Processed ${index + 1}/${jsonData.length} books...`);
        }
        
      } catch (bookError) {
        const jsonBook = bookData as JsonBookData;
        const bookInfo = jsonBook?.BookId ? `BookId: ${jsonBook.BookId}` : 'BookId: unknown';
        console.error(`Error processing book at index ${index} (${bookInfo}):`, bookError);
        errorCount++;
      }
    }
    
    console.log('\n--- Import Summary ---');
    console.log(`Total books processed: ${jsonData.length}`);
    console.log(`Successfully imported/updated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the import function
importBooks()
  .then(() => {
    console.log('Book import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Book import failed:', error);
    process.exit(1);
  });