import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { EnumExamSessionStatus } from "../../../../db/schema/exam/enums.ts";
import { eq, and } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const AbandonParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const AbandonResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Optional(Type.Any()),
});

const abandonSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/abandon/:id",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      params: AbandonParams,
      response: {
        200: AbandonResponse,
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
      request: FastifyRequest<{ Params: typeof AbandonParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { id } = request.params;

      const [session] = await db
        .update(examSessions)
        .set({ status: EnumExamSessionStatus.ABANDONED, updatedAt: new Date() })
        .where(
          and(
            eq(examSessions.id, id),
            eq(examSessions.userId, userId),
            eq(examSessions.status, EnumExamSessionStatus.IN_PROGRESS),
          ),
        )
        .returning({ id: examSessions.id });

      if (!session) {
        return reply.notFound(t(($) => $.exam.sessions.abandon.notFound));
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.sessions.abandon.success),
        data: { id: session.id },
      });
    }),
  });
};

export default abandonSessionRoute;
