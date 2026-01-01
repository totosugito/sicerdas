import fs from 'fs';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema/index.ts';
import { books } from '../../db/schema/book-schema.ts';
import { EnumContentStatus } from '../../db/schema/enum-app.ts';
import envConfig from '../../config/env.config.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'development' ? '.env.devel' : '.env' });

// Type definition for the JSON book data
interface JsonBookData {
  id: number;
  sGrade: number; // Will be used directly as education_grade_id
  sGroup: number; // Will be used directly as bookGroupId
  title: string;
  author: string;
  visible: number; // 0 = published, 1 = archived
  dt: string;
  pg: number;
  sz: number;
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
    const jsonFilePath = 'E:/temp/books.json';
    
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
        const jsonBook: JsonBookData = bookData;
        if (!jsonBook.author) {
            jsonBook.author = '-'
        }
                
        // Validate required fields
        if (!jsonBook.id || !jsonBook.title || !jsonBook.author) {
          console.warn(`Skipping book at index ${index} - ${jsonBook.id}: Missing required fields (id, title, or author)`);
          errorCount++;
          continue;
        }
        
        // Validate grade field
        if (!jsonBook.sGrade) {
          console.warn(`Skipping book "${jsonBook.title}": Missing sGrade field`);
          errorCount++;
          continue;
        }
        
        // Validate book_group field
        if (!jsonBook.sGroup) {
          console.warn(`Skipping book "${jsonBook.title}": Missing sGroup field`);
          errorCount++;
          continue;
        }
               
        // Map status
        const status = jsonBook.visible === 0 ? EnumContentStatus.ARCHIVED : EnumContentStatus.PUBLISHED;
        
        // Check if book already exists by bookId
        const existingBook = await db
          .select({ id: books.id })
          .from(books)
          .where(eq(books.bookId, jsonBook.BookId))
          .limit(1);
        
        const bookInsertData = {
          bookId: jsonBook.id, // Store original BookId in dedicated column
          versionId: 1, // Using version 1 as specified
          bookGroupId: jsonBook.sGroup, // Use book_group directly from JSON as bookGroupId
          educationGradeId: jsonBook.sGrade, // Use grade directly from JSON as education_grade_id
          title: jsonBook.title,
          description: '', // Empty as specified in mapping
          author: jsonBook.author,
          publishedYear: jsonBook.dt || '',
          totalPages: jsonBook.pg || 0,
          size: jsonBook.sz || 0,
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
        const bookInfo = jsonBook?.id ? `BookId: ${jsonBook.id}` : 'BookId: unknown';
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