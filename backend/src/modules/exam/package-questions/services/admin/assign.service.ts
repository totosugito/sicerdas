import { db } from "../../../../../db/db-pool.ts";
import { examPackageQuestions } from "../../../../../db/schema/exam/package-questions.ts";
import { eq, sql, inArray, and } from "drizzle-orm";
import { syncSection, syncPackage } from "../../../../../services/exam/index.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AssignPackageQuestionsParams, AssignResult } from "../../package-questions.schema.ts";

export interface AssignResultResponse extends ServiceResponse {
  data?: AssignResult;
}

export async function assignPackageQuestionsService(
  params: AssignPackageQuestionsParams,
): Promise<AssignResultResponse> {
  const { packageId, sectionId, questionIds } = params;

  let totalAssigned = 0;
  let totalSkipped = 0;

  await db.transaction(async (tx) => {
    const existingAssignments = await tx
      .select({ questionId: examPackageQuestions.questionId })
      .from(examPackageQuestions)
      .where(
        and(
          eq(examPackageQuestions.packageId, packageId),
          inArray(examPackageQuestions.questionId, questionIds),
        ),
      );

    const existingIds = new Set(existingAssignments.map((a) => a.questionId));
    const newQuestionIds = questionIds.filter((id) => !existingIds.has(id));

    totalSkipped = existingIds.size;
    totalAssigned = newQuestionIds.length;

    if (newQuestionIds.length === 0) return;

    const currentMax = await tx
      .select({ maxOrder: sql<number>`MAX(${examPackageQuestions.order})` })
      .from(examPackageQuestions)
      .where(
        and(
          eq(examPackageQuestions.packageId, packageId),
          eq(examPackageQuestions.sectionId, sectionId),
        ),
      );

    let nextOrder = (currentMax[0]?.maxOrder ?? 0) + 1;

    const values = newQuestionIds.map((questionId) => ({
      packageId,
      sectionId,
      questionId,
      order: nextOrder++,
    }));

    await tx.insert(examPackageQuestions).values(values);

    await syncPackage(packageId, tx);
    await syncSection(sectionId, tx);
  });

  return {
    success: true,
    data: { totalAssigned, totalSkipped },
  };
}
