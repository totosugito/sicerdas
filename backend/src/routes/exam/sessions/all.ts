import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { AllHistoryBody, AllSessionHistoryResponse } from "../../../modules/exam/sessions/sessions.schema.ts";
import { allSessionsService } from "../../../modules/exam/sessions/services/all-sessions.service.ts";

const allSessionHistoryRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/all",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      body: AllHistoryBody,
      response: {
        200: AllSessionHistoryResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AllHistoryBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof AllSessionHistoryResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await allSessionsService(userId, request.body);

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

export default allSessionHistoryRoute;
