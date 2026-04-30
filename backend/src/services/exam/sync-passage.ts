import { db as defaultDb } from "../../db/db-pool.ts";
import { examPassages } from "../../db/schema/exam/passages.ts";
import { examQuestions } from "../../db/schema/exam/questions.ts";
import { eq, sql } from "drizzle-orm";

/**
 * Synchronizes all counters for a Passage (Total Questions, Active Questions).
 */
export async function syncPassage(passageId: string, tx?: any): Promise<void> {
  if (!passageId) return;
  const client = tx || defaultDb;

  const [stats] = await client
    .select({
      totalQuestions: sql<number>`COUNT(*)`,
      activeQuestions: sql<number>`SUM(CASE WHEN ${examQuestions.isActive} = true THEN 1 ELSE 0 END)`,
    })
    .from(examQuestions)
    .where(eq(examQuestions.passageId, passageId));

  await client
    .update(examPassages)
    .set({
      totalQuestions: Number(stats?.totalQuestions || 0),
      activeQuestions: Number(stats?.activeQuestions || 0),
      updatedAt: new Date(),
    })
    .where(eq(examPassages.id, passageId));
}
