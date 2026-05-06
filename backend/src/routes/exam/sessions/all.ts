import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import { examSessions } from "../../../db/schema/exam/sessions.ts";
import { examPackages } from "../../../db/schema/exam/packages.ts";
import { examPackageSections } from "../../../db/schema/exam/package-sections.ts";
import { eq, desc, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const AllHistoryBody = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const AllHistoryResponse = Type.Object({
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
        score: Type.Union([Type.Number(), Type.Null()]),
        totalCorrect: Type.Number(),
        totalWrong: Type.Number(),
        totalSkipped: Type.Number(),
        packageTitle: Type.String(),
        sectionTitle: Type.String(),
        packageId: Type.String({ format: "uuid" }),
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

const allSessionHistoryRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/all",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      body: AllHistoryBody,
      response: {
        200: AllHistoryResponse,
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{
        Body: typeof AllHistoryBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { page = 1, limit = 10 } = request.body;

      const offset = (page - 1) * limit;

      const baseConditions = eq(examSessions.userId, userId);

      // 1. Get Total Count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(examSessions)
        .where(baseConditions);

      const total = Number(countResult?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // 2. Get Paginated Items with Package and Section titles
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
          packageTitle: examPackages.title,
          sectionTitle: examPackageSections.title,
          packageId: examSessions.packageId,
        })
        .from(examSessions)
        .innerJoin(examPackages, eq(examSessions.packageId, examPackages.id))
        .innerJoin(examPackageSections, eq(examSessions.sectionId, examPackageSections.id))
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
            score: h.score !== null ? Number(h.score) : null,
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

export default allSessionHistoryRoute;
