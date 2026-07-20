import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { HistoryBody, HistorySessionResponse } from "../../../modules/exam/sessions/sessions.schema.ts";
import { historySessionService } from "../../../modules/exam/sessions/services/history-session.service.ts";

const sessionHistoryRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/history",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      body: HistoryBody,
      response: {
        200: HistorySessionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof HistoryBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof HistorySessionResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await historySessionService(userId, request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.sessions.history.success),
        data: result.data,
      });
    },
  });
};

export default sessionHistoryRoute;
