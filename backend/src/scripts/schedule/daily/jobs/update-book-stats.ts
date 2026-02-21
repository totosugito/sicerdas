#!/usr/bin/env node
/**
 * Script to update book statistics based on user interactions
 * 
 * This script calculates the average rating, total unique views, and unique downloads
 * for each book based on individual user interactions and updates the bookEventStats table.
 * 
 * Usage:
 *   cross-env NODE_ENV=development ts-node src/scripts/update-book-stats.ts
 */

import { EnumContentType, EnumEventStatus } from '../../../../db/schema/enum/enum-app.ts';
import { db } from '../../../../db/db-pool.ts';
import { books, bookEventStats, userBookInteractions } from '../../../../db/schema/book-schema.ts';
import { appEventHistory } from '../../../../db/schema/app/app-event-history.ts';
import { eq, sql, and } from 'drizzle-orm';

async function updateBookStats() {
    console.log('Starting book stats update process...');

    try {
        // Process books in batches to handle large datasets efficiently
        const batchSize = 100;
        let offset = 0;
        let processedCount = 0;

        // Process books in batches
        do {
            // Select books with basic info
            const batchBooks = await db.select({ id: books.id })
                .from(books)
                .limit(batchSize)
                .offset(offset);

            if (batchBooks.length === 0) break;

            console.log(`Processing batch of ${batchBooks.length} books...`);

            for (const book of batchBooks) {
                // 0. Get Legacy Stats (Archived)
                const legacyStatsResult = await db.select({
                    legacyStats: bookEventStats.legacyStats
                })
                    .from(bookEventStats)
                    .where(eq(bookEventStats.bookId, book.id));

                const legacyStats = legacyStatsResult[0]?.legacyStats || { viewCount: 0, downloadCount: 0 };
                const legacyViews = legacyStats.viewCount || 0;
                const legacyDownloads = legacyStats.downloadCount || 0;

                // 1. Get Logged-in Stats (Views, Downloads, Ratings)
                const loggedInStats = await db.select({
                    ratingCount: sql<number>`count(case when ${userBookInteractions.rating} > 0 then 1 else null end)`,
                    ratingSum: sql<string>`sum(case when ${userBookInteractions.rating} > 0 then ${userBookInteractions.rating} else 0 end)`,
                    viewCount: sql<number>`sum(${userBookInteractions.viewCount})`,
                    downloadCount: sql<number>`sum(${userBookInteractions.downloadCount})`
                })
                    .from(userBookInteractions)
                    .where(eq(userBookInteractions.bookId, book.id));

                const loggedInViews = Number(loggedInStats[0]?.viewCount || 0);
                const loggedInDownloads = Number(loggedInStats[0]?.downloadCount || 0);

                const ratingCount = Number(loggedInStats[0]?.ratingCount || 0);
                const ratingSum = loggedInStats[0]?.ratingSum ? Number(loggedInStats[0].ratingSum) : 0;
                // Calculate Average Rating: Sum / Count
                const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : '0.00';

                // Format ratingSum for storage
                const ratingSumFormatted = ratingSum.toFixed(2);

                // 2. Get Guest Stats (Views) - Count Unique Sessions
                const guestViewStats = await db.select({
                    count: sql<number>`count(distinct ${appEventHistory.sessionId})`
                })
                    .from(appEventHistory)
                    .where(and(
                        eq(appEventHistory.referenceId, book.id),
                        eq(appEventHistory.contentType, EnumContentType.BOOK),
                        eq(appEventHistory.action, EnumEventStatus.VIEW),
                        sql`${appEventHistory.userId} IS NULL`
                    ));

                // 3. Get Guest Stats (Downloads)
                const guestDownloadStats = await db.select({
                    count: sql<number>`count(distinct ${appEventHistory.sessionId})`
                })
                    .from(appEventHistory)
                    .where(and(
                        eq(appEventHistory.referenceId, book.id),
                        eq(appEventHistory.contentType, EnumContentType.BOOK),
                        eq(appEventHistory.action, EnumEventStatus.DOWNLOAD),
                        sql`${appEventHistory.userId} IS NULL`
                    ));

                const guestViews = Number(guestViewStats[0]?.count || 0);
                const guestDownloads = Number(guestDownloadStats[0]?.count || 0);

                const totalViews = loggedInViews + guestViews + legacyViews;
                const totalDownloads = loggedInDownloads + guestDownloads + legacyDownloads;

                // Update Stats (Always update to ensure correctness)
                await db.update(bookEventStats)
                    .set({
                        rating: avgRating,
                        ratingCount: ratingCount,
                        ratingSum: ratingSumFormatted,
                        viewCount: totalViews,
                        downloadCount: totalDownloads,
                        updatedAt: new Date()
                    })
                    .where(eq(bookEventStats.bookId, book.id));

                processedCount++;
            }

            offset += batchSize;
        } while (true);

        return {
            success: true,
            details: {
                processedBooksCount: processedCount,
                batchSize: batchSize,
                totalBatches: Math.ceil(processedCount / batchSize)
            }
        };

    } catch (error) {
        console.error('Error updating book stats:', error);
        throw error;
    }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    updateBookStats()
        .then((result) => {
            console.log('Result:', JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch((error) => {
            console.error('Stats update script failed:', error);
            process.exit(1);
        });
}

export default updateBookStats;
