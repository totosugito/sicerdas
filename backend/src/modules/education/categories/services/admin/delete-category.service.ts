import { db } from "../../../../../db/db-pool.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";

export async function deleteCategoryService(id: string): Promise<ServiceResponse> {
  const existingCategory = await db.query.educationCategories.findFirst({
    where: eq(educationCategories.id, id),
  });

  if (!existingCategory) {
    return { success: false, statusCode: 404, errorKey: ($) => $.education.categories.delete.notFound };
  }

  const inUseCheck = await db.query.examPackages.findFirst({
    where: eq(examPackages.categoryId, id),
  });

  if (inUseCheck) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.categories.delete.inUse };
  }

  await db.delete(educationCategories).where(eq(educationCategories.id, id));

  return { success: true };
}
