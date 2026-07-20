import { db } from "../../../../db/db-pool.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { and, inArray, eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { UnassignQuestionTagsParams } from "../question-tags.schema.ts";

export interface UnassignResult extends ServiceResponse {}

export async function unassignQuestionTagsService(
  params: UnassignQuestionTagsParams,
): Promise<UnassignResult> {
  const { questionId, tagIds } = params;

  await db
    .delete(examQuestionTags)
    .where(
      and(
        eq(examQuestionTags.questionId, questionId),
        inArray(examQuestionTags.tagId, tagIds),
      ),
    );

  return { success: true };
}
