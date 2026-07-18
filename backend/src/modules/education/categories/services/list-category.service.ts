import { db } from "../../../../db/db-pool.ts";
import { educationCategories } from "../../../../db/schema/education/categories.ts";
import { desc, ilike, or, and, sql, eq, asc } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { CategoryListParams, CategoryData } from "../education.schema.ts";

export interface ListCategoryResult extends ServiceResponse {
  data?: { items: CategoryData[]; meta: { total: number; page: number; limit: number; totalPages: number } };
}

export async function listCategoryService(
  params: CategoryListParams,
  isAdmin: boolean,
): Promise<ListCategoryResult> {
  const { search, isActive, sortOrder = "desc", page = 1, limit = 10 } = params;
  let { sortBy = "updatedAt" } = params;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (!isAdmin) {
    conditions.push(eq(educationCategories.isActive, true));
    if (sortBy === "isActive") sortBy = "name";
  } else {
    if (isActive !== undefined) conditions.push(eq(educationCategories.isActive, isActive));
  }

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        ilike(educationCategories.name, searchTerm),
        ilike(educationCategories.description, searchTerm),
      ),
    );
  }

  let baseQuery = db.select().from(educationCategories);
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  const sortColumn =
    sortBy === "name"
      ? educationCategories.name
      : sortBy === "isActive"
        ? educationCategories.isActive
        : sortBy === "createdAt"
          ? educationCategories.createdAt
          : educationCategories.updatedAt;

  const queryWithSort = orderDir === "asc" ? baseQuery.orderBy(asc(sortColumn)) : baseQuery.orderBy(desc(sortColumn));

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(queryWithSort.as("subquery"));

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);
  const items = await queryWithSort.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      items: items.map((cat) => ({
        ...cat,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
      })),
      meta: { total, page, limit, totalPages },
    },
  };
}
