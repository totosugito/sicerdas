import { db } from "../../../../db/db-pool.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { desc, ilike, or, and, sql, asc } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { PaginationMeta } from "../../../../types/response.ts";
import type { GradeListParams, GradeData } from "../education.schema.ts";

export interface ListGradeResult extends ServiceResponse {
  data?: { items: GradeData[]; meta: PaginationMeta };
}

export async function listGradeService(params: GradeListParams): Promise<ListGradeResult> {
  const { search, sortBy = "updatedAt", sortOrder = "desc", page = 1, limit = 10 } = params;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        ilike(educationGrades.name, searchTerm),
        ilike(educationGrades.desc, searchTerm),
        ilike(educationGrades.grade, searchTerm),
      ),
    );
  }

  let baseQuery = db.select().from(educationGrades);
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  const sortColumn =
    sortBy === "name"
      ? educationGrades.name
      : sortBy === "grade"
        ? educationGrades.grade
        : sortBy === "createdAt"
          ? educationGrades.createdAt
          : educationGrades.updatedAt;

  const queryWithSort = orderDir === "asc" ? baseQuery.orderBy(asc(sortColumn)) : baseQuery.orderBy(desc(sortColumn));

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(queryWithSort.as("subquery"));
  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);
  const items = await queryWithSort.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      items: items.map((grade) => ({
        ...grade,
        isDefault: grade.isDefault ?? true,
        createdAt: grade.createdAt ? grade.createdAt.toISOString() : null,
        updatedAt: grade.updatedAt ? grade.updatedAt.toISOString() : null,
      })),
      meta: { total, page, limit, totalPages },
    },
  };
}
