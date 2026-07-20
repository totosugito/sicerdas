import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { desc, ilike, and, sql, eq, getTableColumns } from "drizzle-orm";
import type { ServiceResponse, PaginationMeta } from "../../../../types/index.ts";
import type { PassageListParams, PassageResponseItemT } from "../passages.schema.ts";

export interface ListPassagesResult extends ServiceResponse {
  data?: {
    items: PassageResponseItemT[];
    meta: PaginationMeta;
  };
}

export async function listPassagesService(
  body: PassageListParams,
): Promise<ListPassagesResult> {
  const {
    search,
    isActive,
    sortBy = "updatedAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
    subjectId,
  } = body;

  const offset = (page - 1) * limit;

  const conditions = [];

  if (isActive !== undefined) conditions.push(eq(examPassages.isActive, isActive));
  if (subjectId !== undefined) conditions.push(eq(examPassages.subjectId, subjectId));

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(ilike(examPassages.title, searchTerm));
  }

  // Build Query
  let baseQuery = db
    .select({
      ...getTableColumns(examPassages),
      subjectName: examSubjects.name,
    })
    .from(examPassages)
    .leftJoin(examSubjects, eq(examPassages.subjectId, examSubjects.id));

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  // Add Sorting
  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  let queryWithSort;

  switch (sortBy) {
    case "title":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPassages.title)
          : baseQuery.orderBy(desc(examPassages.title));
      break;
    case "createdAt":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPassages.createdAt)
          : baseQuery.orderBy(desc(examPassages.createdAt));
      break;
    case "updatedAt":
    default:
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPassages.updatedAt)
          : baseQuery.orderBy(desc(examPassages.updatedAt));
      break;
  }

  // Meta calculations
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(queryWithSort.as("subquery"));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  // Execute Paginated Fetch
  const items = await queryWithSort.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      items: items.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content as Record<string, unknown>[],
        isActive: p.isActive,
        totalQuestions: p.totalQuestions,
        activeQuestions: p.activeQuestions,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        subjectId: p.subjectId,
        subjectName: p.subjectName || "",
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    },
  };
}
