import { db } from "../../../../db/db-pool.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { CreateTagParams, TagData } from "../education.schema.ts";

export interface CreateTagResult extends ServiceResponse {
  data?: TagData;
}

export async function createTagService(
  params: CreateTagParams,
  userId: string,
): Promise<CreateTagResult> {
  const existingTag = await db.query.educationTags.findFirst({
    where: eq(educationTags.name, params.name),
  });

  if (existingTag) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.tags.create.exists };
  }

  const [newTag] = await db
    .insert(educationTags)
    .values({
      name: params.name,
      description: params.description,
      isActive: params.isActive ?? true,
      createdByUserId: userId,
    })
    .returning();

  return {
    success: true,
    data: {
      ...newTag,
      totalQuestions: 0,
      createdAt: newTag.createdAt.toISOString(),
      updatedAt: newTag.updatedAt.toISOString(),
    },
  };
}
