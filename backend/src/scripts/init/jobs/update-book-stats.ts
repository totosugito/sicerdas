import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, count, and } from 'drizzle-orm';
import * as schema from '../../../db/schema/index.ts';
import { books, bookGroupStats } from '../../../db/schema/book/index.ts';
import { EnumContentStatus } from '../../../db/schema/enum/enum-app.ts';
import envConfig from '../../../config/env.config.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'development' ? '.env.devel' : '.env' });

/**
 * Function to update book group statistics
 * This updates the book_group_stats table with the total number of published books in each group
 */
export async function updateBookGroupStats(db: any) {
    console.log('\n--- Updating Book Group Statistics ---');

    // Get all book groups that have books
    const bookGroups = await db
        .select({ bookGroupId: books.bookGroupId })
        .from(books)
        .where(eq(books.status, EnumContentStatus.PUBLISHED))
        .groupBy(books.bookGroupId);

    console.log(`Found ${bookGroups.length} book groups with published books`);

    let updatedGroups = 0;

    for (const group of bookGroups) {
        // Count books for this group (only published books)
        const bookCountResult = await db
            .select({ count: count() })
            .from(books)
            .where(and(
                eq(books.bookGroupId, group.bookGroupId),
                eq(books.status, EnumContentStatus.PUBLISHED)
            ));

        const bookTotal = Number(bookCountResult[0].count);

        // Check if stats record already exists for this group
        const existingStats = await db
            .select()
            .from(bookGroupStats)
            .where(eq(bookGroupStats.bookGroupId, group.bookGroupId))
            .limit(1);

        if (existingStats.length > 0) {
            // Update existing stats record
            await db
                .update(bookGroupStats)
                .set({
                    bookTotal,
                    updatedAt: new Date()
                })
                .where(eq(bookGroupStats.bookGroupId, group.bookGroupId));
        } else {
            // Create new stats record
            await db
                .insert(bookGroupStats)
                .values({
                    bookGroupId: group.bookGroupId,
                    bookTotal
                });
        }

        updatedGroups++;

        // Progress indicator
        if (updatedGroups % 100 === 0) {
            console.log(`Updated statistics for ${updatedGroups}/${bookGroups.length} book groups...`);
        }
    }

    console.log(`Successfully updated statistics for ${updatedGroups} book groups`);
}

/**
 * Main function to run the update job
 */
export async function runUpdateBookStats() {
    const pool = new pg.Pool({
        connectionString: envConfig.db.url,
        max: 10,
    });

    try {
        const db = drizzle({ client: pool, schema });
        await updateBookGroupStats(db);
    } catch (error) {
        console.error('Update book stats job failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('update-book-stats.ts')) {
    runUpdateBookStats()
        .then(() => {
            console.log('Update book stats job completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Update book stats job failed:', error);
            process.exit(1);
        });
}
