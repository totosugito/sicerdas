#!/usr/bin/env node
/**
 * Script to archive guest user events older than 1 month.
 * 
 * Performance features:
 * 1. Single CTE atomic update for legacyStats JSONB calculation in Postgres.
 * 2. Batched deletion (SKIP LOCKED) for old app_event_history records to prevent table locks.
 * 3. Zero Node.js N+1 queries or RAM bloat.
 */

import { db } from '../../../../db/db-pool.ts';
import { sql } from 'drizzle-orm';
import { subMonths } from 'date-fns';
import { fileURLToPath } from 'url';

export async function archiveGuestEvents() {
  console.log('[Job] Starting guest events archiving process...');

  try {
    const cutoffDate = subMonths(new Date(), 1);
    console.log(`[Job] Archiving events older than: ${cutoffDate.toISOString()}`);

    // 1. Atomic CTE update of legacyStats in book_event_stats
    const updateResult = await db.execute<{ updated_count: number }>(sql`
      WITH old_guest_events AS (
        SELECT 
          reference_id as book_id,
          COUNT(DISTINCT CASE WHEN action = 'view' THEN session_id END)::int as view_count,
          COUNT(DISTINCT CASE WHEN action = 'download' THEN session_id END)::int as download_count
        FROM app_event_history
        WHERE content_type = 'book'
          AND user_id IS NULL
          AND created_at < ${cutoffDate}
          AND action IN ('view', 'download')
        GROUP BY reference_id
      ),
      updated_stats AS (
        UPDATE book_event_stats bes
        SET legacy_stats = jsonb_build_object(
          'viewCount', COALESCE((bes.legacy_stats->>'viewCount')::int, 0) + oge.view_count,
          'downloadCount', COALESCE((bes.legacy_stats->>'downloadCount')::int, 0) + oge.download_count
        ),
        updated_at = NOW()
        FROM old_guest_events oge
        WHERE bes.book_id = oge.book_id
        RETURNING bes.book_id
      )
      SELECT COUNT(*)::int as updated_count FROM updated_stats;
    `);

    const updatedBooksCount = Number(updateResult.rows[0]?.updated_count ?? 0);
    console.log(`[Job] Updated legacy stats for ${updatedBooksCount} books.`);

    // 2. Batched delete of old app_event_history records
    console.log('[Job] Deleting archived events in batches...');

    let totalDeleted = 0;
    const BATCH_SIZE = 5000;
    const MAX_BATCHES = 100; // Safety guard: max 500,000 events per daily run
    let batchCount = 0;

    while (batchCount < MAX_BATCHES) {
      const deleteRes = await db.execute<{ deleted_count: number }>(sql`
        WITH target_events AS (
          SELECT id 
          FROM app_event_history
          WHERE created_at < ${cutoffDate}
            AND content_type = 'book'
            AND action IN ('view', 'download')
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        ),
        deleted_events AS (
          DELETE FROM app_event_history
          WHERE id IN (SELECT id FROM target_events)
          RETURNING id
        )
        SELECT COUNT(*)::int as deleted_count FROM deleted_events;
      `);

      const batchDeleted = Number(deleteRes.rows[0]?.deleted_count ?? 0);

      if (batchDeleted === 0) {
        break; // No more old events to delete
      }

      totalDeleted += batchDeleted;
      batchCount++;

      if (batchDeleted < BATCH_SIZE) {
        break; // Last partial batch reached
      }
    }

    console.log(`[Job] Archiving completed successfully. Deleted ${totalDeleted} event logs.`);

    return {
      success: true,
      details: {
        cutoffDate: cutoffDate.toISOString(),
        updatedLegacyStatsForBooks: updatedBooksCount,
        deletedEventsCount: totalDeleted,
      },
    };
  } catch (error) {
    console.error('[Job] Error archiving guest events:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPath(import.meta.url)) {
  archiveGuestEvents()
    .then((result) => {
      console.log('Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('Archiving job failed:', error);
      process.exit(1);
    });
}

export default archiveGuestEvents;
