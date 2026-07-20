import { db } from "../../../../db/db-pool.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { desc, ilike, or, and, sql, eq, asc } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { PaginationMeta } from "../../../../types/response.ts";
import type { SubjectListParams, SubjectData } from "../education.schema.ts";

export interface ListSubjectResult extends ServiceResponse {
  data?: { items: SubjectData[]; meta: PaginationMeta };
}

export async function listSubjectService(
  params: SubjectListParams,
  isAdmin: boolean,
): Promise<ListSubjectResult> {
  const { search, isActive, sortOrder = "desc", page = 1, limit = 10 } = params;
  let { sortBy = "updatedAt" } = params;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (!isAdmin) {
    conditions.push(eq(examSubjects.isActive, true));
    if (sortBy === "isActive") sortBy = "name";
  } else {
    if (isActive !== undefined) conditions.push(eq(examSubjects.isActive, isActive));
  }

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      or(ilike(examSubjects.name, searchTerm), ilike(examSubjects.description, searchTerm)),
    );
  }

  let baseQuery = db.select().from(examSubjects);
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  const sortColumn =
    sortBy === "name"
      ? examSubjects.name
      : sortBy === "isActive"
        ? examSubjects.isActive
        : sortBy === "createdAt"
          ? examSubjects.createdAt
          : examSubjects.updatedAt;

  const queryWithSort =
    orderDir === "asc" ? baseQuery.orderBy(asc(sortColumn)) : baseQuery.orderBy(desc(sortColumn));

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(queryWithSort.as("subquery"));

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);
  const items = await queryWithSort.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      items: items.map((sub) => ({
        ...sub,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString(),
      })),
      meta: { total, page, limit, totalPages },
    },
  };
}
