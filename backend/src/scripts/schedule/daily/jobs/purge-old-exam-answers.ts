import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examSessionAnswers } from "../../../../db/schema/exam/session-answers.ts";
import { eq, lt, and, inArray } from "drizzle-orm";
import env from "../../../../config/env.config.ts";

/**
 * Deletes detailed question answers for sessions older than retention period.
 * Preserves the session record itself (with pre-calculated stats).
 */
export const purgeOldExamAnswers = async () => {
  console.log("[Job] Starting purge of old exam session answers...");

  const retentionDays = env.exam.retentionDays;
  const cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() - retentionDays);

  // 1. Find sessions older than retentionDays that aren't already purged
  const oldSessions = await db
    .select({ id: examSessions.id })
    .from(examSessions)
    .where(and(lt(examSessions.createdAt, cutOffDate), eq(examSessions.isAnswersPurged, false)))
    .limit(1000); // Process in batches

  if (oldSessions.length === 0) {
    console.log("[Job] No old sessions to purge.");
    return;
  }

  const sessionIds = oldSessions.map((s) => s.id);

  try {
    await db.transaction(async (tx) => {
      // 2. Delete the answers
      await tx.delete(examSessionAnswers).where(inArray(examSessionAnswers.sessionId, sessionIds));

      // 3. Mark as purged
      await tx
        .update(examSessions)
        .set({ isAnswersPurged: true, updatedAt: new Date() })
        .where(inArray(examSessions.id, sessionIds));
    });

    console.log(`[Job] Successfully purged answers for ${sessionIds.length} sessions.`);

    // If we hit the limit, there might be more
    if (oldSessions.length === 1000) {
      console.log("[Job] Batch limit reached, more sessions may need purging.");
    }
  } catch (error) {
    console.error("[Job] Error during purge-old-exam-answers:", error);
  }
};
