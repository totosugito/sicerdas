#!/usr/bin/env node
/**
 * Script to update book statistics based on user interactions
 * 
 * Performance features:
 * 1. Single CTE SQL query for fast bulk calculation.
 * 2. 24-hour modified window filter to avoid querying inactive books.
 * 3. `IS DISTINCT FROM` guards to prevent unnecessary DB updates when stats haven't changed.
 */

import { db } from '../../../../db/db-pool.ts';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'url';

async function updateBookStats() {
  console.log('[Job] Starting book stats update process...');

  try {
    const result = await db.execute(sql`
      WITH book_interactions_agg AS (
        SELECT 
          book_id,
          COALESCE(SUM(CASE WHEN rating > '0.00' THEN 1 ELSE 0 END), 0)::int as calc_rating_count,
          COALESCE(SUM(rating), 0)::numeric as calc_rating_sum,
          COALESCE(SUM(view_count), 0)::int as logged_in_views,
          COALESCE(SUM(download_count), 0)::int as logged_in_downloads
        FROM book_interactions
        GROUP BY book_id
      ),
      guest_stats_agg AS (
        SELECT 
          reference_id as book_id,
          COUNT(DISTINCT CASE WHEN action = 'view' THEN session_id END)::int as guest_views,
          COUNT(DISTINCT CASE WHEN action = 'download' THEN session_id END)::int as guest_downloads
        FROM app_event_history
        WHERE content_type = 'book' 
          AND user_id IS NULL
        GROUP BY reference_id
      )
      UPDATE book_event_stats bes
      SET 
        rating_count = COALESCE(bia.calc_rating_count, 0),
        rating_sum = COALESCE(bia.calc_rating_sum, 0.00),
        rating = CASE 
          WHEN COALESCE(bia.calc_rating_count, 0) > 0 
          THEN ROUND((bia.calc_rating_sum / bia.calc_rating_count)::numeric, 2)
          ELSE 0.00 
        END,
        view_count = COALESCE(bia.logged_in_views, 0) + COALESCE(gsa.guest_views, 0) + COALESCE((bes.legacy_stats->>'viewCount')::int, 0),
        download_count = COALESCE(bia.logged_in_downloads, 0) + COALESCE(gsa.guest_downloads, 0) + COALESCE((bes.legacy_stats->>'downloadCount')::int, 0),
        updated_at = NOW()
      FROM books b
      LEFT JOIN book_interactions_agg bia ON bia.book_id = b.id
      LEFT JOIN guest_stats_agg gsa ON gsa.book_id = b.id
      WHERE bes.book_id = b.id
        AND (
          b.updated_at >= NOW() - INTERVAL '24 hours' OR
          EXISTS (SELECT 1 FROM book_interactions bi WHERE bi.book_id = b.id AND bi.updated_at >= NOW() - INTERVAL '24 hours') OR
          EXISTS (SELECT 1 FROM app_event_history aeh WHERE aeh.reference_id = b.id AND aeh.content_type = 'book' AND aeh.created_at >= NOW() - INTERVAL '24 hours')
        )
        AND (
          bes.view_count IS DISTINCT FROM (COALESCE(bia.logged_in_views, 0) + COALESCE(gsa.guest_views, 0) + COALESCE((bes.legacy_stats->>'viewCount')::int, 0)) OR
          bes.download_count IS DISTINCT FROM (COALESCE(bia.logged_in_downloads, 0) + COALESCE(gsa.guest_downloads, 0) + COALESCE((bes.legacy_stats->>'downloadCount')::int, 0)) OR
          bes.rating_count IS DISTINCT FROM COALESCE(bia.calc_rating_count, 0) OR
          bes.rating IS DISTINCT FROM (
            CASE 
              WHEN COALESCE(bia.calc_rating_count, 0) > 0 
              THEN ROUND((bia.calc_rating_sum / bia.calc_rating_count)::numeric, 2)
              ELSE 0.00 
            END
          )
        );
    `);

    console.log('[Job] Book stats update completed successfully.');

    return {
      success: true,
      details: {
        rowCount: result.rowCount || 0,
      },
    };
  } catch (error) {
    console.error('[Job] Error updating book stats:', error);
    throw error;
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPath(import.meta.url)) {
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
