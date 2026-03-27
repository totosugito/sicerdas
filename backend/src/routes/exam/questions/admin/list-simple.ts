import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { and, desc, sql, eq, notExists } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { EnumDifficultyLevel, EnumQuestionType } from "../../../../db/schema/exam/enums.ts";

const QuestionListQuery = Type.Object({
  search: Type.Optional(Type.String({ description: "Search term for question content" })),
  subjectId: Type.Optional(Type.String({ format: "uuid" })),
  difficulty: Type.Optional(Type.Enum(EnumDifficultyLevel)),
  type: Type.Optional(Type.Enum(EnumQuestionType)),
  requiredTier: Type.Optional(Type.String()),
  educationGradeId: Type.Optional(Type.Number()),
  excludePackageId: Type.Optional(Type.String({ format: "uuid" })),
  isActive: Type.Optional(
    Type.Boolean({ description: "Filter by active status. Omit to fetch all." }),
  ),
  sortBy: Type.Optional(Type.String({ description: "Sort field", default: "updatedAt" })),
  sortOrder: Type.Optional(
    Type.String({ description: "Sort order: asc or desc", default: "desc" }),
  ),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const SimpleQuestionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  subjectId: Type.String({ format: "uuid" }),
  subjectName: Type.Optional(Type.String()),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  difficulty: Type.Enum(EnumDifficultyLevel),
});

const ListSimpleQuestionsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(SimpleQuestionResponseItem),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});

const listSimpleQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Admin Exam Questions"],
      body: QuestionListQuery,
      response: {
        200: ListSimpleQuestionsResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Body: typeof QuestionListQuery.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
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
      } = request.body;

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

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.questions.list.success),
        data: {
          items: items.map((q) => ({
            id: q.id,
            subjectId: q.subjectId,
            subjectName: (q as any).subjectName,
            content: q.content as Record<string, unknown>[],
            difficulty: q.difficulty,
          })),
          meta: {
            total,
            page,
            limit,
            totalPages,
          },
        },
      });
    }),
  });
};

export default listSimpleQuestionRoute;
