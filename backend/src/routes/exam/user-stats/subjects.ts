import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import { examUserStatsSubject } from "../../../db/schema/exam/user-stats-subject.ts";
import { examSubjects } from "../../../db/schema/exam/subjects.ts";
import { eq, desc, asc, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const SubjectStatsQuery = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 100 })),
  sortBy: Type.Optional(Type.String({ default: "accuracyRate" })),
  order: Type.Optional(Type.Union([Type.Literal("asc"), Type.Literal("desc")], { default: "desc" })),
});

const SubjectStatsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(
      Type.Object({
        id: Type.String({ format: "uuid" }),
        subjectId: Type.String({ format: "uuid" }),
        subjectName: Type.String(),
        totalQuestionsAnswered: Type.Number(),
        totalCorrect: Type.Number(),
        totalWrong: Type.Number(),
        accuracyRate: Type.String(),
        updatedAt: Type.String({ format: "date-time" }),
      }),
    ),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});

const getSubjectStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/subjects",
    method: "POST",
    schema: {
      tags: ["Client Exam Analytics"],
      body: SubjectStatsQuery,
      response: {
        200: SubjectStatsResponse,
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{
        Body: typeof SubjectStatsQuery.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { page = 1, limit = 10, sortBy = "accuracyRate", order = "desc" } = request.body;

      const offset = (page - 1) * limit;

      const baseConditions = eq(examUserStatsSubject.userId, userId);

      // 1. Get Total Count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(examUserStatsSubject)
        .where(baseConditions);

      const total = Number(countResult?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // 2. Map sort column
      let sortColumn: any = examUserStatsSubject.accuracyRate;
      if (sortBy === "subjectName") sortColumn = examSubjects.name;
      else if (sortBy === "totalQuestionsAnswered") sortColumn = examUserStatsSubject.totalQuestionsAnswered;
      else if (sortBy === "updatedAt") sortColumn = examUserStatsSubject.updatedAt;

      const stats = await db
        .select({
          id: examUserStatsSubject.id,
          subjectId: examUserStatsSubject.subjectId,
          subjectName: examSubjects.name,
          totalQuestionsAnswered: examUserStatsSubject.totalQuestionsAnswered,
          totalCorrect: examUserStatsSubject.totalCorrect,
          totalWrong: examUserStatsSubject.totalWrong,
          accuracyRate: examUserStatsSubject.accuracyRate,
          updatedAt: examUserStatsSubject.updatedAt,
        })
        .from(examUserStatsSubject)
        .innerJoin(examSubjects, eq(examUserStatsSubject.subjectId, examSubjects.id))
        .where(baseConditions)
        .orderBy(order === "desc" ? desc(sortColumn) : asc(sortColumn))
        .limit(limit)
        .offset(offset);

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.user_stats.subjects.success),
        data: {
          items: stats.map((s) => ({
            ...s,
            updatedAt: s.updatedAt.toISOString(),
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

export default getSubjectStatsRoute;
