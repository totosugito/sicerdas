#!/usr/bin/env node
/**
 * Script to update book ratings based on user interactions
 * 
 * This script calculates the average rating for each book based on individual user ratings
 * and updates the bookEventStats table with the new average ratings.
 * 
 * Usage:
 *   pnpm db:book_update_ratings
 *   # or
 *   cross-env NODE_ENV=development ts-node src/scripts/update-book-ratings.ts
 */

import { db } from '../db/index.ts';
import { books, bookEventStats, userBookInteractions } from '../db/schema/book-schema.ts';
import { eq, sql, and, isNotNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import envConfig from '../config/env.config.ts';

async function updateBookRatings() {
  console.log('Starting book ratings update process...');
  
  try {
    // Process books in batches to handle large datasets efficiently
    const batchSize = 100;
    let offset = 0;
    let processedCount = 0;
    
    // Get all books that have at least one rating
    do {
      const booksWithRatings = await db.select({
        bookId: books.id,
        count: sql<number>`count(${userBookInteractions.rating})`,
        avgRating: sql<number>`avg(${userBookInteractions.rating})`
      })
      .from(books)
      .leftJoin(userBookInteractions, eq(books.id, userBookInteractions.bookId))
      .where(and(
        isNotNull(userBookInteractions.rating),
        sql`${userBookInteractions.rating} > 0`
      ))
      .groupBy(books.id)
      .limit(batchSize)
      .offset(offset);
      
      if (booksWithRatings.length === 0) break;
      
      console.log(`Processing batch of ${booksWithRatings.length} books with ratings`);
      
      // Update each book's average rating
      for (const bookRating of booksWithRatings) {
        const avgRating = Number(bookRating.avgRating).toFixed(2);
        
        // Update the bookEventStats table with the new average rating
        await db.update(bookEventStats)
          .set({
            rating: avgRating,
            updatedAt: new Date()
          })
          .where(eq(bookEventStats.bookId, bookRating.bookId));
        
        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount} books so far...`);
        }
      }
      
      offset += batchSize;
    } while (true);
    
    console.log(`Updated ratings for ${processedCount} books with ratings`);
    
    // Handle books with no ratings (set rating to 0.00)
    // Reset counters for this section
    offset = 0;
    processedCount = 0;
    
    // First, get all books
    const allBooks = await db.select({
      bookId: books.id
    })
    .from(books);
    
    // Then get books that have ratings
    const booksWithRatingsList = await db.selectDistinct({
      bookId: userBookInteractions.bookId
    })
    .from(userBookInteractions)
    .where(and(
      isNotNull(userBookInteractions.rating),
      sql`${userBookInteractions.rating} > 0`
    ));
    
    // Find books without ratings
    const booksWithRatingsIds = new Set(booksWithRatingsList.map(b => b.bookId));
    const booksWithoutRatings = allBooks.filter(book => !booksWithRatingsIds.has(book.bookId));
    
    console.log(`Found ${booksWithoutRatings.length} books without ratings`);
    
    // Update books without ratings
    for (const book of booksWithoutRatings) {
      // Update the bookEventStats table with 0.00 rating
      await db.update(bookEventStats)
        .set({
          rating: '0.00',
          updatedAt: new Date()
        })
        .where(eq(bookEventStats.bookId, book.bookId));
      
      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`Processed ${processedCount} books without ratings so far...`);
      }
    }
    
    console.log(`Updated ratings for ${processedCount} books without ratings`);
    
    console.log('Book ratings update process completed successfully');
  } catch (error) {
    console.error('Error updating book ratings:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateBookRatings()
    .then(() => {
      console.log('Ratings update script finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Ratings update script failed:', error);
      process.exit(1);
    });
}

export default updateBookRatings;