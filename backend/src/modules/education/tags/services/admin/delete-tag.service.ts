import { db } from "../../../../../db/db-pool.ts";
import { educationTags } from "../../../../../db/schema/education/tags.ts";
import { examQuestionTags } from "../../../../../db/schema/exam/question-tags.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";

export async function deleteTagService(id: string): Promise<ServiceResponse> {
  const existingTag = await db.query.educationTags.findFirst({
    where: eq(educationTags.id, id),
  });

  if (!existingTag) {
    return { success: false, statusCode: 404, errorKey: ($) => $.education.tags.delete.notFound };
  }

  const inUseCheck = await db.query.examQuestionTags.findFirst({
    where: eq(examQuestionTags.tagId, id),
  });

  if (inUseCheck) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.tags.delete.inUse };
  }

  await db.delete(educationTags).where(eq(educationTags.id, id));
  return { success: true };
}
