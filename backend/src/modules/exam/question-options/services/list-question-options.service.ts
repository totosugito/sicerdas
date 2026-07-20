import { db } from "../../../../db/db-pool.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { desc, and, sql, eq } from "drizzle-orm";
import type { ServiceResponse, PaginationMeta } from "../../../../types/index.ts";
import type { QuestionOptionListParams, QuestionOptionResponseItemT } from "../question-options.schema.ts";

export interface ListQuestionOptionsResult extends ServiceResponse {
  data?: {
    items: QuestionOptionResponseItemT[];
    meta: PaginationMeta;
  };
}

export async function listQuestionOptionsService(
  body: QuestionOptionListParams,
): Promise<ListQuestionOptionsResult> {
  const {
    questionId,
    isCorrect,
    sortBy = "order",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = body;

  const offset = (page - 1) * limit;

  const conditions = [];

  if (questionId) conditions.push(eq(examQuestionOptions.questionId, questionId));
  if (isCorrect !== undefined) conditions.push(eq(examQuestionOptions.isCorrect, isCorrect));

  // Build Query
  let baseQuery = db.select().from(examQuestionOptions);
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  // Add Sorting
  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  let queryWithSort;

  switch (sortBy) {
    case "order":
    default:
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examQuestionOptions.order)
          : baseQuery.orderBy(desc(examQuestionOptions.order));
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
      items: items.map((opt) => ({
        ...opt,
        content: opt.content as Record<string, unknown>[],
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
