import { db as defaultDb } from "../../db/db-pool.ts";
import { examPackageSections } from "../../db/schema/exam/package-sections.ts";
import { examPackageQuestions } from "../../db/schema/exam/package-questions.ts";
import { examQuestions } from "../../db/schema/exam/questions.ts";
import { eq, sql } from "drizzle-orm";

/**
 * Fully synchronizes all counters for a Section (Total Questions, Active Questions, Max Score).
 */
export async function syncSection(sectionId: string, tx?: any): Promise<void> {
  const client = tx || defaultDb;

  const [stats] = await client
    .select({
      totalQuestions: sql<number>`COUNT(*)`,
      activeQuestions: sql<number>`SUM(CASE WHEN ${examQuestions.isActive} = true THEN 1 ELSE 0 END)`,
      maxScore: sql<number>`COALESCE(SUM(${examQuestions.maxScore}), 0)`,
    })
    .from(examPackageQuestions)
    .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
    .where(eq(examPackageQuestions.sectionId, sectionId));

  await client
    .update(examPackageSections)
    .set({
      totalQuestions: Number(stats?.totalQuestions || 0),
      activeQuestions: Number(stats?.activeQuestions || 0),
      maxScore: Number(stats?.maxScore || 0),
      updatedAt: new Date(),
    })
    .where(eq(examPackageSections.id, sectionId));
}
