import { db } from "../../../../db/db-pool.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { AssignQuestionTagsParams } from "../question-tags.schema.ts";

export interface AssignResult extends ServiceResponse {}

export async function assignQuestionTagsService(
  params: AssignQuestionTagsParams,
): Promise<AssignResult> {
  const { questionId, tagIds } = params;

  // Use ON CONFLICT DO NOTHING to avoid duplicate key errors
  const values = tagIds.map((tagId) => ({
    questionId,
    tagId,
  }));

  await db.insert(examQuestionTags).values(values).onConflictDoNothing();

  return { success: true };
}
