#!/usr/bin/env node
/**
 * Script to archive guest user events older than 1 month.
 * 
 * It aggregates the counts (unique sessions) of old events and adds them to
 * the 'legacyStats' column in 'bookEventStats'. Then it deletes the old records.
 * 
 * Usage:
 *   cross-env NODE_ENV=development ts-node src/scripts/archive-guest-events.ts
 */

import { db } from '../../../../db/db-pool.ts';
import { bookEventStats } from '../../../../db/schema/book/index.ts';
import { appEventHistory } from '../../../../db/schema/app/app-event-history.ts';
import { eq, sql, and, lt, or } from 'drizzle-orm';
import { subMonths } from 'date-fns';
import { EnumContentType, EnumEventStatus } from '../../../../db/schema/enum/enum-app.ts';

async function archiveGuestEvents() {
    console.log('Starting guest events archiving process...');

    try {
        const cutoffDate = subMonths(new Date(), 1);
        console.log(`Archiving events older than: ${cutoffDate.toISOString()}`);

        // 1. Find books that have old guest events
        // We do this by aggregating the old events directly

        // Count Views to archive
        const viewsToArchive = await db.select({
            referenceId: appEventHistory.referenceId,
            count: sql<number>`count(distinct ${appEventHistory.sessionId})`
        })
            .from(appEventHistory)
            .where(and(
                lt(appEventHistory.createdAt, cutoffDate),
                eq(appEventHistory.contentType, EnumContentType.BOOK),
                eq(appEventHistory.action, EnumEventStatus.VIEW),
                sql`${appEventHistory.userId} IS NULL`
            ))
            .groupBy(appEventHistory.referenceId);

        // Count Downloads to archive
        const downloadsToArchive = await db.select({
            referenceId: appEventHistory.referenceId,
            count: sql<number>`count(distinct ${appEventHistory.sessionId})`
        })
            .from(appEventHistory)
            .where(and(
                lt(appEventHistory.createdAt, cutoffDate),
                eq(appEventHistory.contentType, EnumContentType.BOOK),
                eq(appEventHistory.action, EnumEventStatus.DOWNLOAD),
                sql`${appEventHistory.userId} IS NULL`
            ))
            .groupBy(appEventHistory.referenceId);

        console.log(`Found ${viewsToArchive.length} books with old views to archive.`);
        console.log(`Found ${downloadsToArchive.length} books with old downloads to archive.`);

        // Map counts by bookId
        const archiveMap = new Map<string, { viewCount: number, downloadCount: number }>();

        for (const view of viewsToArchive) {
            const id = view.referenceId;
            if (!archiveMap.has(id)) archiveMap.set(id, { viewCount: 0, downloadCount: 0 });
            archiveMap.get(id)!.viewCount = Number(view.count);
        }

        for (const dl of downloadsToArchive) {
            const id = dl.referenceId;
            if (!archiveMap.has(id)) archiveMap.set(id, { viewCount: 0, downloadCount: 0 });
            archiveMap.get(id)!.downloadCount = Number(dl.count);
        }

        let updatedBooks = 0;

        // 2. Update legacyStats in bookEventStats
        for (const [bookId, counts] of archiveMap.entries()) {
            console.log(`Updating legacy stats for book ${bookId}: +${counts.viewCount} views, +${counts.downloadCount} downloads`);

            // Use SQL to atomically update the JSONB field
            // legacyStats = legacyStats || {viewCount: 0, downloadCount: 0}
            // newViewCount = oldViewCount + counts.viewCount

            // Note: Drizzle/Postgres JSONB updating can be tricky. 
            // We'll read the current stats first to be safe, though atomic update is better.
            // Since this script is likely scheduled and not concurrent implementation:

            const currentStatsParams = await db.select({
                legacyStats: bookEventStats.legacyStats
            })
                .from(bookEventStats)
                .where(eq(bookEventStats.bookId, bookId));

            if (currentStatsParams.length > 0) {
                const currentLegacy = currentStatsParams[0].legacyStats || { viewCount: 0, downloadCount: 0 };
                const newLegacy = {
                    viewCount: currentLegacy.viewCount + counts.viewCount,
                    downloadCount: currentLegacy.downloadCount + counts.downloadCount
                };

                await db.update(bookEventStats)
                    .set({ legacyStats: newLegacy })
                    .where(eq(bookEventStats.bookId, bookId));

                updatedBooks++;
            }
        }

        console.log(`Updated legacy stats for ${updatedBooks} books.`);

        // 3. Delete old events (both guest and logged-in)
        console.log('Deleting archived events...');

        const deleteResult = await db.delete(appEventHistory)
            .where(and(
                lt(appEventHistory.createdAt, cutoffDate),
                eq(appEventHistory.contentType, EnumContentType.BOOK),
                or(
                    eq(appEventHistory.action, EnumEventStatus.VIEW),
                    eq(appEventHistory.action, EnumEventStatus.DOWNLOAD)
                )
            ))
            .returning({ id: appEventHistory.id }); // Optional: verify deletion count

        return {
            success: true,
            details: {
                cutoffDate: cutoffDate.toISOString(),
                foundBooksWithViews: viewsToArchive.length,
                foundBooksWithDownloads: downloadsToArchive.length,
                updatedLegacyStatsForBooks: updatedBooks,
                deletedEventsCount: deleteResult.length
            }
        };

    } catch (error) {
        console.error('Error archiving guest events:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    archiveGuestEvents()
        .then((result) => {
            console.log('Result:', JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch(() => process.exit(1));
}

export default archiveGuestEvents;
