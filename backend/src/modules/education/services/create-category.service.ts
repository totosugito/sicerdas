import { db } from "../../../db/db-pool.ts";
import { educationCategories } from "../../../db/schema/education/categories.ts";
import { eq } from "drizzle-orm";
import { stringToKey } from "../../../utils/my-utils.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { CreateCategoryParams, CategoryData } from "../education.schema.ts";

export interface CreateCategoryResult extends ServiceResponse {
  data?: CategoryData;
}

export async function createCategoryService(
  params: CreateCategoryParams,
  userId: string,
): Promise<CreateCategoryResult> {
  const categoryKey = params.key || stringToKey(params.name);

  const existingByName = await db.query.educationCategories.findFirst({
    where: eq(educationCategories.name, params.name),
  });

  if (existingByName) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.categories.create.exists };
  }

  const existingByKey = await db.query.educationCategories.findFirst({
    where: eq(educationCategories.key, categoryKey),
  });

  if (existingByKey) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.categories.create.exists };
  }

  const [newCategory] = await db
    .insert(educationCategories)
    .values({
      name: params.name,
      key: categoryKey,
      description: params.description,
      isActive: params.isActive ?? true,
      createdByUserId: userId,
    })
    .returning();

  return {
    success: true,
    data: {
      ...newCategory,
      createdAt: newCategory.createdAt.toISOString(),
      updatedAt: newCategory.updatedAt.toISOString(),
    },
  };
}
