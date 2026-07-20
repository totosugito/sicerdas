import { db } from "../../../../db/db-pool.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { desc, ilike, or, and, sql, eq, count, getTableColumns, asc } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { PaginationMeta } from "../../../../types/response.ts";
import type { TagListParams, TagData } from "../education.schema.ts";

export interface ListTagResult extends ServiceResponse {
  data?: { items: TagData[]; meta: PaginationMeta };
}

export async function listTagService(
  params: TagListParams,
  isAdmin: boolean,
): Promise<ListTagResult> {
  const { search, isActive, sortOrder = "desc", page = 1, limit = 10 } = params;
  let { sortBy = "updatedAt" } = params;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (!isAdmin) {
    conditions.push(eq(educationTags.isActive, true));
    if (sortBy === "isActive") sortBy = "name";
  } else {
    if (isActive !== undefined) conditions.push(eq(educationTags.isActive, isActive));
  }

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      or(ilike(educationTags.name, searchTerm), ilike(educationTags.description, searchTerm)),
    );
  }

  let baseQuery = db
    .select({
      ...getTableColumns(educationTags),
      totalQuestions: count(examQuestionTags.questionId).mapWith(Number),
    })
    .from(educationTags)
    .leftJoin(examQuestionTags, eq(educationTags.id, examQuestionTags.tagId))
    .groupBy(educationTags.id);

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  const sortColumn =
    sortBy === "name"
      ? educationTags.name
      : sortBy === "isActive"
        ? educationTags.isActive
        : sortBy === "createdAt"
          ? educationTags.createdAt
          : educationTags.updatedAt;

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
      items: items.map((tag) => ({
        ...tag,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      })),
      meta: { total, page, limit, totalPages },
    },
  };
}
