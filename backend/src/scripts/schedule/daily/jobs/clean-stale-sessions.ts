import { db } from "../../../../db/db-pool.ts";
import { sql } from "drizzle-orm";
import env from "../../../../config/env.config.ts";

/**
 * Marks IN_PROGRESS sessions that haven't been updated for a long time as ABANDONED.
 *
 * Performance features:
 * 1. Batched SQL CTE queries to prevent massive table locks.
 * 2. Uses `FOR UPDATE SKIP LOCKED` to avoid lock contention with active users.
 * 3. Zero Node.js memory overhead (uses SQL COUNT instead of returning ID arrays).
 */
export const cleanStaleSessions = async () => {
  console.log("[Job] Starting cleanup of stale exam sessions...");

  const staleDays = env.exam.staleSessionDays;
  const cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() - staleDays);

  const BATCH_SIZE = 1000;
  const MAX_BATCHES = 50; // Safety guard: max 50,000 sessions per daily run

  let totalCleaned = 0;
  let batchCount = 0;

  try {
    while (batchCount < MAX_BATCHES) {
      const result = await db.execute<{ cleaned_count: number }>(sql`
        WITH target_sessions AS (
          SELECT id 
          FROM exam_sessions 
          WHERE status = 'in_progress' 
            AND updated_at < ${cutOffDate}
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        ),
        updated_sessions AS (
          UPDATE exam_sessions
          SET status = 'abandoned', updated_at = NOW()
          WHERE id IN (SELECT id FROM target_sessions)
          RETURNING id
        )
        SELECT COUNT(*)::int as cleaned_count FROM updated_sessions;
      `);

      const batchCleaned = Number(result.rows[0]?.cleaned_count ?? 0);

      if (batchCleaned === 0) {
        break; // No more stale sessions left
      }

      totalCleaned += batchCleaned;
      batchCount++;

      if (batchCleaned < BATCH_SIZE) {
        break; // Last partial batch reached
      }
    }

    console.log(`[Job] Cleanup complete. Marked ${totalCleaned} stale sessions as abandoned.`);
  } catch (error) {
    console.error("[Job] Error during clean-stale-sessions:", error);
  }
};
