import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { and, desc, sql, eq, notExists } from "drizzle-orm";
import { EnumDifficultyLevel, EnumQuestionType } from "../../../../db/schema/exam/enums.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { QuestionListSimpleParams, SimpleQuestionResponseItemT } from "../questions.schema.ts";
import type { PaginationMeta } from "../../../../types/response.ts";

export interface ListQuestionSimpleResult extends ServiceResponse {
  data?: {
    items: SimpleQuestionResponseItemT[];
    meta: PaginationMeta;
  };
}

export async function listQuestionSimpleService(
  params: QuestionListSimpleParams,
): Promise<ListQuestionSimpleResult> {
  const {
    subjectId,
    difficulty,
    type,
    requiredTier,
    educationGradeId,
    excludePackageId,
    isActive,
    sortBy = "updatedAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  const offset = (page - 1) * limit;

  const conditions = [];

  if (isActive !== undefined) {
    conditions.push(eq(examQuestions.isActive, isActive));
  }

  if (subjectId) conditions.push(eq(examQuestions.subjectId, subjectId));
  if (difficulty) conditions.push(eq(examQuestions.difficulty, difficulty));
  if (type) conditions.push(eq(examQuestions.type, type));
  if (requiredTier) conditions.push(eq(examQuestions.requiredTier, requiredTier));
  if (educationGradeId) conditions.push(eq(examQuestions.educationGradeId, educationGradeId));
  if (excludePackageId) {
    conditions.push(
      notExists(
        db
          .select({ questionId: examPackageQuestions.questionId })
          .from(examPackageQuestions)
          .where(
            and(
              eq(examPackageQuestions.packageId, excludePackageId),
              eq(examPackageQuestions.questionId, examQuestions.id),
            ),
          ),
      ),
    );
  }

  // Simplified select
  let baseQuery = db
    .select({
      id: examQuestions.id,
      subjectId: examQuestions.subjectId,
      subjectName: examSubjects.name,
      content: examQuestions.content,
      difficulty: examQuestions.difficulty,
      updatedAt: examQuestions.updatedAt,
      createdAt: examQuestions.createdAt,
      type: examQuestions.type,
      requiredTier: examQuestions.requiredTier,
      educationGradeId: examQuestions.educationGradeId,
    })
    .from(examQuestions)
    .leftJoin(examSubjects, eq(examQuestions.subjectId, examSubjects.id));

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  const order = sortOrder === "asc" ? "asc" : "desc";
  let queryWithSort;

  switch (sortBy) {
    case "updatedAt":
      queryWithSort =
        order === "asc"
          ? baseQuery.orderBy(examQuestions.updatedAt)
          : baseQuery.orderBy(desc(examQuestions.updatedAt));
      break;
    case "difficulty":
      queryWithSort =
        order === "asc"
          ? baseQuery.orderBy(examQuestions.difficulty)
          : baseQuery.orderBy(desc(examQuestions.difficulty));
      break;
    case "createdAt":
    default:
      queryWithSort =
        order === "asc"
          ? baseQuery.orderBy(examQuestions.createdAt)
          : baseQuery.orderBy(desc(examQuestions.createdAt));
      break;
  }

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(queryWithSort.as("subquery"));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const items = await queryWithSort.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      items: items.map((q) => ({
        id: q.id,
        subjectId: q.subjectId,
        subjectName: (q as any).subjectName,
        content: q.content as Record<string, unknown>[],
        difficulty: q.difficulty as (typeof EnumDifficultyLevel)[keyof typeof EnumDifficultyLevel],
        updatedAt: q.updatedAt.toISOString(),
        createdAt: q.createdAt.toISOString(),
        type: q.type as (typeof EnumQuestionType)[keyof typeof EnumQuestionType],
        requiredTier: q.requiredTier,
        educationGradeId: q.educationGradeId,
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
