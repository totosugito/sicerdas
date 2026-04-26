import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { EnumExamSessionStatus } from "../../../../db/schema/exam/enums.ts";
import { eq, lt, and } from "drizzle-orm";
import env from "../../../../config/env.config.ts";

/**
 * Marks IN_PROGRESS sessions that haven't been updated for a long time as ABANDONED.
 */
export const cleanStaleSessions = async () => {
  console.log("[Job] Starting cleanup of stale exam sessions...");

  const staleDays = env.exam.staleSessionDays;
  const cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() - staleDays);

  try {
    const result = await db
      .update(examSessions)
      .set({
        status: EnumExamSessionStatus.ABANDONED,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(examSessions.status, EnumExamSessionStatus.IN_PROGRESS),
          lt(examSessions.updatedAt, cutOffDate),
        ),
      )
      .returning({ id: examSessions.id });

    console.log(`[Job] Cleanup complete. Marked ${result.length} stale sessions as abandoned.`);
  } catch (error) {
    console.error("[Job] Error during clean-stale-sessions:", error);
  }
};
