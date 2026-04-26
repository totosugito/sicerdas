import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { eq, and, desc } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const HistoryParams = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.String({ format: "uuid" }),
});

const HistoryResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Array(
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
});

const sessionHistoryRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/history/:packageId/:sectionId",
    method: "GET",
    schema: {
      tags: ["Client Exam Sessions"],
      params: HistoryParams,
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
      request: FastifyRequest<{ Params: typeof HistoryParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { packageId, sectionId } = request.params;

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
        .where(
          and(
            eq(examSessions.userId, userId),
            eq(examSessions.packageId, packageId),
            eq(examSessions.sectionId, sectionId),
          ),
        )
        .orderBy(desc(examSessions.startTime));

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.sessions.history.success),
        data: history.map((h) => ({
          ...h,
          startTime: h.startTime.toISOString(),
          endTime: h.endTime?.toISOString() ?? null,
        })) as any,
      });
    }),
  });
};

export default sessionHistoryRoute;
