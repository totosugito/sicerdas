import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { eq, and, desc, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const HistoryBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.String({ format: "uuid" }),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 5, minimum: 1, maximum: 50 })),
});

const HistoryResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(
      Type.Object({
        id: Type.String({ format: "uuid" }),
        startTime: Type.String({ format: "date-time" }),
        endTime: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
        status: Type.String(),
        mode: Type.String(),
        score: Type.Union([Type.String(), Type.Null()]),
        totalCorrect: Type.Number(),
        totalWrong: Type.Number(),
        totalSkipped: Type.Number(),
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

const sessionHistoryRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/history",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      body: HistoryBody,
      response: {
        200: HistoryResponse,
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
      request: FastifyRequest<{
        Body: typeof HistoryBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { packageId, sectionId, page = 1, limit = 5 } = request.body;

      const offset = (page - 1) * limit;

      const baseConditions = and(
        eq(examSessions.userId, userId),
        eq(examSessions.packageId, packageId),
        eq(examSessions.sectionId, sectionId),
      );

      // 1. Get Total Count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(examSessions)
        .where(baseConditions);

      const total = Number(countResult?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // 2. Get Paginated Items
      const history = await db
        .select({
          id: examSessions.id,
          startTime: examSessions.startTime,
          endTime: examSessions.endTime,
          status: examSessions.status,
          mode: examSessions.mode,
          score: examSessions.score,
          totalCorrect: examSessions.totalCorrect,
          totalWrong: examSessions.totalWrong,
          totalSkipped: examSessions.totalSkipped,
        })
        .from(examSessions)
        .where(baseConditions)
        .orderBy(desc(examSessions.startTime))
        .limit(limit)
        .offset(offset);

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.sessions.history.success),
        data: {
          items: history.map((h) => ({
            ...h,
            startTime: h.startTime.toISOString(),
            endTime: h.endTime?.toISOString() ?? null,
          })) as any,
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

export default sessionHistoryRoute;
