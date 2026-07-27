import { db } from "../../../../../db/db-pool.ts";
import { examPackageQuestions } from "../../../../../db/schema/exam/package-questions.ts";
import { examQuestions } from "../../../../../db/schema/exam/questions.ts";
import { and, eq, inArray } from "drizzle-orm";
import { syncSection, syncPackage } from "../../../../../services/exam/index.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { UnassignPackageQuestionsParams } from "../../package-questions.schema.ts";

export async function unassignPackageQuestionsService(
  params: UnassignPackageQuestionsParams,
): Promise<ServiceResponse> {
  const { packageId, questionIds } = params;

  await db.transaction(async (tx) => {
    // 1. Get info about questions being unassigned (only those actually in this package)
    const assignments = await tx
      .select({
        id: examQuestions.id,
        isActive: examQuestions.isActive,
        sectionId: examPackageQuestions.sectionId,
      })
      .from(examPackageQuestions)
      .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
      .where(
        and(
          eq(examPackageQuestions.packageId, packageId),
          inArray(examPackageQuestions.questionId, questionIds),
        ),
      );

    if (assignments.length === 0) return;

    // 2. Perform deletion
    await tx
      .delete(examPackageQuestions)
      .where(
        and(
          eq(examPackageQuestions.packageId, packageId),
          inArray(examPackageQuestions.questionId, questionIds),
        ),
      );

    // 3. Fully sync Package and Section counters via SQL Ground Truth
    await syncPackage(packageId, tx);

    const uniqueSectionIds = [...new Set(assignments.map((a) => a.sectionId))];
    for (const sectionId of uniqueSectionIds) {
      await syncSection(sectionId, tx);
    }
  });

  return { success: true };
}
