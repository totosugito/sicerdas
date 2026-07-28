import { db } from "../../../../db/db-pool.ts";
import { sql } from "drizzle-orm";
import env from "../../../../config/env.config.ts";

/**
 * Deletes detailed question answers for sessions older than retention period.
 * Preserves the session record itself (with pre-calculated stats).
 *
 * Performance features:
 * 1. Single SQL CTE for deletion & flag update per batch (zero round-trips for session IDs).
 * 2. Uses `FOR UPDATE SKIP LOCKED` to avoid lock contention.
 * 3. Loops through batches to clear backlogs safely in a single daily run.
 */
export const purgeOldExamAnswers = async () => {
  console.log("[Job] Starting purge of old exam session answers...");

  const retentionDays = env.exam.retentionDays;
  const cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() - retentionDays);

  const BATCH_SIZE = 1000;
  const MAX_BATCHES = 50; // Safety guard: max 50,000 sessions per daily run

  let totalPurgedSessions = 0;
  let batchCount = 0;

  try {
    while (batchCount < MAX_BATCHES) {
      const result = await db.execute<{ purged_count: number }>(sql`
        WITH target_sessions AS (
          SELECT id 
          FROM exam_sessions 
          WHERE created_at < ${cutOffDate} 
            AND is_answers_purged = false
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        ),
        deleted_answers AS (
          DELETE FROM exam_session_answers
          WHERE session_id IN (SELECT id FROM target_sessions)
        ),
        updated_sessions AS (
          UPDATE exam_sessions
          SET is_answers_purged = true, updated_at = NOW()
          WHERE id IN (SELECT id FROM target_sessions)
          RETURNING id
        )
        SELECT COUNT(*)::int as purged_count FROM updated_sessions;
      `);

      const batchPurged = Number(result.rows[0]?.purged_count ?? 0);

      if (batchPurged === 0) {
        break; // No more old sessions left to purge
      }

      totalPurgedSessions += batchPurged;
      batchCount++;

      console.log(`[Job] Purged batch ${batchCount}: ${batchPurged} sessions.`);

      if (batchPurged < BATCH_SIZE) {
        break; // Last partial batch reached
      }
    }

    console.log(`[Job] Finished purge-old-exam-answers. Total sessions purged: ${totalPurgedSessions}`);
  } catch (error) {
    console.error("[Job] Error during purge-old-exam-answers:", error);
  }
};
