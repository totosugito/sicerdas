import { db } from "../../../db/db-pool.ts";
import { educationCategories } from "../../../db/schema/education/categories.ts";
import { eq, and, ne } from "drizzle-orm";
import { stringToKey } from "../../../utils/my-utils.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { UpdateCategoryParams, CategoryData } from "../education.schema.ts";

export interface UpdateCategoryResult extends ServiceResponse {
  data?: CategoryData;
}

export async function updateCategoryService(
  id: string,
  params: UpdateCategoryParams,
): Promise<UpdateCategoryResult> {
  const existingCategory = await db.query.educationCategories.findFirst({
    where: eq(educationCategories.id, id),
  });

  if (!existingCategory) {
    return { success: false, statusCode: 404, errorKey: ($) => $.education.categories.update.notFound };
  }

  const categoryKey =
    params.key || (params.name !== existingCategory.name ? stringToKey(params.name) : existingCategory.key);

  const nameConflict = await db.query.educationCategories.findFirst({
    where: and(eq(educationCategories.name, params.name), ne(educationCategories.id, id)),
  });

  if (nameConflict) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.categories.update.exists };
  }

  const keyConflict = await db.query.educationCategories.findFirst({
    where: and(eq(educationCategories.key, categoryKey), ne(educationCategories.id, id)),
  });

  if (keyConflict) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.categories.update.exists };
  }

  const [updatedCategory] = await db
    .update(educationCategories)
    .set({
      name: params.name,
      key: categoryKey,
      description: params.description,
      isActive: params.isActive,
      updatedAt: new Date(),
    })
    .where(eq(educationCategories.id, id))
    .returning();

  return {
    success: true,
    data: {
      ...updatedCategory,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.updatedAt.toISOString(),
    },
  };
}
