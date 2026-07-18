import { db } from "../../../../db/db-pool.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { eq, and, count, getTableColumns } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { TagData } from "../education.schema.ts";

export interface DetailTagResult extends ServiceResponse {
  data?: TagData;
}

export async function detailTagService(
  id: string,
  isAdmin: boolean,
): Promise<DetailTagResult> {
  const conditions = [eq(educationTags.id, id)];
  if (!isAdmin) conditions.push(eq(educationTags.isActive, true));

  const [result] = await db
    .select({
      ...getTableColumns(educationTags),
      totalQuestions: count(examQuestionTags.questionId).mapWith(Number),
    })
    .from(educationTags)
    .leftJoin(examQuestionTags, eq(educationTags.id, examQuestionTags.tagId))
    .where(and(...conditions))
    .groupBy(educationTags.id)
    .limit(1);

  if (!result) {
    return { success: false, statusCode: 404, errorKey: ($) => $.education.tags.detail.notFound };
  }

  return {
    success: true,
    data: {
      ...result,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    },
  };
}
