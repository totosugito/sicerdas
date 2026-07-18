import { db } from "../../../../db/db-pool.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { eq, and, ne } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { UpdateTagParams, TagData } from "../education.schema.ts";

export interface UpdateTagResult extends ServiceResponse {
  data?: TagData;
}

export async function updateTagService(
  id: string,
  params: UpdateTagParams,
): Promise<UpdateTagResult> {
  const existingTag = await db.query.educationTags.findFirst({
    where: eq(educationTags.id, id),
  });

  if (!existingTag) {
    return { success: false, statusCode: 404, errorKey: ($) => $.education.tags.update.notFound };
  }

  if (params.name) {
    const nameConflict = await db.query.educationTags.findFirst({
      where: and(eq(educationTags.name, params.name), ne(educationTags.id, id)),
    });

    if (nameConflict) {
      return { success: false, statusCode: 409, errorKey: ($) => $.education.tags.update.exists };
    }
  }

  const [updatedTag] = await db
    .update(educationTags)
    .set({ name: params.name ?? existingTag.name, description: params.description, isActive: params.isActive, updatedAt: new Date() })
    .where(eq(educationTags.id, id))
    .returning();

  return {
    success: true,
    data: {
      ...updatedTag,
      totalQuestions: 0,
      createdAt: updatedTag.createdAt.toISOString(),
      updatedAt: updatedTag.updatedAt.toISOString(),
    },
  };
}
