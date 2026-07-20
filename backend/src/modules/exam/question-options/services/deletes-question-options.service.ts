import { db } from "../../../../db/db-pool.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { inArray } from "drizzle-orm";
import { syncQuestionMaxScore } from "../../../../services/exam/index.ts";
import type { ServiceResponse } from "../../../../types/index.ts";

export async function deletesQuestionOptionsService(
  ids: string[],
): Promise<ServiceResponse> {
  // Identify affected questions before delete
  const affectedQuestions = await db
    .select({ questionId: examQuestionOptions.questionId })
    .from(examQuestionOptions)
    .where(inArray(examQuestionOptions.id, ids));

  const uniqueQuestionIds = [...new Set(affectedQuestions.map((q) => q.questionId))];

  // Perform Hard Delete for all provided IDs
  await db.delete(examQuestionOptions).where(inArray(examQuestionOptions.id, ids));

  // Sync each affected question's maxScore
  for (const questionId of uniqueQuestionIds) {
    await syncQuestionMaxScore(questionId);
  }

  return { success: true };
}
