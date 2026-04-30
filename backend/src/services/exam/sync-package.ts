import { db as defaultDb } from "../../db/db-pool.ts";
import { examPackages } from "../../db/schema/exam/packages.ts";
import { examPackageQuestions } from "../../db/schema/exam/package-questions.ts";
import { examQuestions } from "../../db/schema/exam/questions.ts";
import { eq, sql } from "drizzle-orm";

/**
 * Synchronizes all counters for a Package (Total Questions, Active Questions).
 */
export async function syncPackage(packageId: string, tx?: any): Promise<void> {
  const client = tx || defaultDb;

  const [stats] = await client
    .select({
      totalQuestions: sql<number>`COUNT(*)`,
      activeQuestions: sql<number>`SUM(CASE WHEN ${examQuestions.isActive} = true THEN 1 ELSE 0 END)`,
    })
    .from(examPackageQuestions)
    .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
    .where(eq(examPackageQuestions.packageId, packageId));

  await client
    .update(examPackages)
    .set({
      totalQuestions: Number(stats?.totalQuestions || 0),
      activeQuestions: Number(stats?.activeQuestions || 0),
      updatedAt: new Date(),
    })
    .where(eq(examPackages.id, packageId));
}
