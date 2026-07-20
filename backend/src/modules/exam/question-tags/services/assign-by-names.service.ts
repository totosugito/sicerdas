import { db } from "../../../../db/db-pool.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { AssignQuestionTagsByNameParams } from "../question-tags.schema.ts";

export async function assignQuestionTagsByNameService(
  params: AssignQuestionTagsByNameParams,
): Promise<ServiceResponse> {
  const { questionId, tags } = params;

  const tagIds: string[] = [];

  for (const tagName of tags) {
    const trimmedName = tagName.trim();
    if (!trimmedName) continue;

    // Try to find existing tag
    const existingTag = await db.query.educationTags.findFirst({
      where: eq(sql`lower(${educationTags.name})`, trimmedName.toLowerCase()),
    });

    let tagId: string;
    if (existingTag) {
      tagId = existingTag.id;
    } else {
      // Create new tag
      const [newTag] = await db
        .insert(educationTags)
        .values({
          name: trimmedName,
        })
        .returning({ id: educationTags.id });
      tagId = newTag.id;
    }
    tagIds.push(tagId);
  }

  if (tagIds.length > 0) {
    // Use ON CONFLICT DO NOTHING to avoid duplicate key errors in assignments
    const values = tagIds.map((tagId) => ({
      questionId,
      tagId,
    }));

    await db.insert(examQuestionTags).values(values).onConflictDoNothing();
  }

  return { success: true };
}
