import { db } from "../../../db/db-pool.ts";
import { educationCategories } from "../../../db/schema/education/categories.ts";
import { and, eq, asc, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";
import type { CategorySimpleData } from "../education.schema.ts";

export interface ListCategorySimpleResult extends ServiceResponse {
  data?: { items: CategorySimpleData[]; meta: { total: number; page: number; limit: number; totalPages: number } };
}

export async function listCategorySimpleService(
  page: number,
  limit: number,
): Promise<ListCategorySimpleResult> {
  const offset = (page - 1) * limit;
  const conditions = [eq(educationCategories.isActive, true)];

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(educationCategories)
    .where(and(...conditions));

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const items = await db
    .select({
      value: educationCategories.id,
      label: educationCategories.name,
      key: educationCategories.key,
    })
    .from(educationCategories)
    .where(and(...conditions))
    .orderBy(asc(educationCategories.name))
    .limit(limit)
    .offset(offset);

  return {
    success: true,
    data: { items, meta: { total, page, limit, totalPages } },
  };
}
