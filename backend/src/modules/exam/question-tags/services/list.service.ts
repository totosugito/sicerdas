import { db } from "../../../../db/db-pool.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { QuestionTagListParams, QuestionTagItemT } from "../question-tags.schema.ts";

export interface ListQuestionTagsResult extends ServiceResponse {
  data?: QuestionTagItemT[];
}

export async function listQuestionTagsService(
  params: QuestionTagListParams,
): Promise<ListQuestionTagsResult> {
  const { questionId, tagId } = params;

  let query = db
    .select({
      questionId: examQuestionTags.questionId,
      tagId: examQuestionTags.tagId,
      tag: {
        id: educationTags.id,
        name: educationTags.name,
      },
    })
    .from(examQuestionTags)
    .leftJoin(educationTags, eq(examQuestionTags.tagId, educationTags.id));

  if (questionId) {
    query = query.where(eq(examQuestionTags.questionId, questionId)) as any;
  } else if (tagId) {
    query = query.where(eq(examQuestionTags.tagId, tagId)) as any;
  }

  const items = await query;

  return {
    success: true,
    data: items.map((item) => ({
      questionId: item.questionId,
      tagId: item.tagId,
      tag: item.tag ? { id: item.tag.id, name: item.tag.name } : undefined,
    })),
  };
}
