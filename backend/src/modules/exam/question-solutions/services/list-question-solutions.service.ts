import { db } from "../../../../db/db-pool.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
import { desc, and, sql, eq } from "drizzle-orm";
import { resolveBlockNoteUrls } from "../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse, PaginationMeta } from "../../../../types/index.ts";
import type { QuestionSolutionListParams, QuestionSolutionResponseItemT } from "../question-solutions.schema.ts";

export interface ListQuestionSolutionsResult extends ServiceResponse {
  data?: {
    items: QuestionSolutionResponseItemT[];
    meta: PaginationMeta;
  };
}

export async function listQuestionSolutionsService(
  body: QuestionSolutionListParams,
): Promise<ListQuestionSolutionsResult> {
  const {
    questionId,
    solutionType,
    requiredTier,
    sortBy = "order",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = body;

  const offset = (page - 1) * limit;

  const conditions = [];

  if (questionId) conditions.push(eq(examQuestionSolutions.questionId, questionId));
  if (solutionType) conditions.push(eq(examQuestionSolutions.solutionType, solutionType as any));
  if (requiredTier) conditions.push(eq(examQuestionSolutions.requiredTier, requiredTier));

  // Build Query
  let baseQuery = db.select().from(examQuestionSolutions);
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  // Add Sorting
  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  let queryWithSort;

  switch (sortBy) {
    case "createdAt":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examQuestionSolutions.createdAt)
          : baseQuery.orderBy(desc(examQuestionSolutions.createdAt));
      break;
    case "order":
    default:
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examQuestionSolutions.order)
          : baseQuery.orderBy(desc(examQuestionSolutions.order));
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
      items: items.map((sol) => ({
        ...sol,
        content: resolveBlockNoteUrls(sol.content as Record<string, unknown>[]),
        createdAt: sol.createdAt.toISOString(),
        updatedAt: sol.updatedAt.toISOString(),
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
