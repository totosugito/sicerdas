import { db } from "../../../../../db/db-pool.ts";
import { examPackageQuestions } from "../../../../../db/schema/exam/package-questions.ts";
import { and, eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { SyncPackageQuestionsOrderParams } from "../../package-questions.schema.ts";

export async function syncPackageQuestionsOrderService(
  params: SyncPackageQuestionsOrderParams,
): Promise<ServiceResponse> {
  const { packageId, sectionId, updates } = params;

  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .update(examPackageQuestions)
        .set({ order: update.order })
        .where(
          and(
            eq(examPackageQuestions.packageId, packageId),
            eq(examPackageQuestions.sectionId, sectionId),
            eq(examPackageQuestions.questionId, update.questionId),
          ),
        );
    }
  });

  return { success: true };
}
