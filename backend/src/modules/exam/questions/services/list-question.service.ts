import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { desc, and, sql, eq, count, getTableColumns } from "drizzle-orm";
import { EnumDifficultyLevel, EnumQuestionType, EnumScoringStrategy } from "../../../../db/schema/exam/enums.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { QuestionListParams, QuestionListItemT } from "../questions.schema.ts";
import type { PaginationMeta } from "../../../../types/response.ts";

export interface ListQuestionResult extends ServiceResponse {
  data?: {
    items: QuestionListItemT[];
    meta: PaginationMeta;
  };
}

export async function listQuestionService(
  params: QuestionListParams,
): Promise<ListQuestionResult> {
  const {
    subjectId,
    difficulty,
    type,
    scoringStrategy,
    requiredTier,
    educationGradeId,
    isActive,
    sortBy = "updatedAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  const offset = (page - 1) * limit;

  const conditions = [];

  // Add active status condition if provided
  if (isActive !== undefined) {
    conditions.push(eq(examQuestions.isActive, isActive));
  }

  // Direct match filters
  if (subjectId) conditions.push(eq(examQuestions.subjectId, subjectId));
  if (difficulty) conditions.push(eq(examQuestions.difficulty, difficulty));
  if (type) conditions.push(eq(examQuestions.type, type));
  if (scoringStrategy) conditions.push(eq(examQuestions.scoringStrategy, scoringStrategy));
  if (requiredTier) conditions.push(eq(examQuestions.requiredTier, requiredTier));
  if (educationGradeId) conditions.push(eq(examQuestions.educationGradeId, educationGradeId));

  // Build Query
  let baseQuery = db
    .select({
      ...getTableColumns(examQuestions),
      totalOptions: count(examQuestionOptions.id).mapWith(Number),
      subjectName: examSubjects.name,
      educationGradeName: educationGrades.name,
      tags: sql`coalesce(
                    json_agg(
                        json_build_object('id', ${educationTags.id}, 'name', ${educationTags.name})
                    ) filter (where ${educationTags.id} is not null), 
                    '[]'
                )`.as("tags"),
    })
    .from(examQuestions)
    .leftJoin(examSubjects, eq(examQuestions.subjectId, examSubjects.id))
    .leftJoin(educationGrades, eq(examQuestions.educationGradeId, educationGrades.id))
    .leftJoin(examQuestionOptions, eq(examQuestions.id, examQuestionOptions.questionId))
    .leftJoin(examQuestionTags, eq(examQuestions.id, examQuestionTags.questionId))
    .leftJoin(educationTags, eq(examQuestionTags.tagId, educationTags.id))
    .groupBy(examQuestions.id, examSubjects.name, educationGrades.name);

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  // Add Sorting
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
    case "type":
      queryWithSort =
        order === "asc"
          ? baseQuery.orderBy(examQuestions.type)
          : baseQuery.orderBy(desc(examQuestions.type));
      break;
    case "requiredTier":
      queryWithSort =
        order === "asc"
          ? baseQuery.orderBy(examQuestions.requiredTier)
          : baseQuery.orderBy(desc(examQuestions.requiredTier));
      break;
    case "educationGradeId":
      queryWithSort =
        order === "asc"
          ? baseQuery.orderBy(examQuestions.educationGradeId)
          : baseQuery.orderBy(desc(examQuestions.educationGradeId));
      break;
    case "createdAt":
    default:
      queryWithSort =
        order === "asc"
          ? baseQuery.orderBy(examQuestions.createdAt)
          : baseQuery.orderBy(desc(examQuestions.createdAt));
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
      items: items.map((q) => ({
        id: q.id,
        subjectId: q.subjectId,
        subjectName: (q as any).subjectName,
        passageId: q.passageId,
        content: q.content as Record<string, unknown>[],
        difficulty: q.difficulty as (typeof EnumDifficultyLevel)[keyof typeof EnumDifficultyLevel],
        type: q.type as (typeof EnumQuestionType)[keyof typeof EnumQuestionType],
        maxScore: q.maxScore,
        scoringStrategy: q.scoringStrategy as (typeof EnumScoringStrategy)[keyof typeof EnumScoringStrategy],
        requiredTier: q.requiredTier,
        educationGradeId: q.educationGradeId,
        educationGradeName: (q as any).educationGradeName,
        isActive: q.isActive,
        variableFormulas:
          q.variableFormulas &&
            typeof q.variableFormulas === "object" &&
            Object.keys(q.variableFormulas).length > 0
            ? {
              variables: (q.variableFormulas as any).variables || [],
              solutions: (q.variableFormulas as any).solutions || {},
            }
            : null,
        totalOptions: q.totalOptions,
        tags: (q as any).tags as { id: string; name: string }[],
        createdAt: q.createdAt.toISOString(),
        updatedAt: q.updatedAt.toISOString(),
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
