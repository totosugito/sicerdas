import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { SaveAnswerBody, SaveAnswerResponse } from "../../../modules/exam/sessions/sessions.schema.ts";
import { saveAnswerService } from "../../../modules/exam/sessions/services/save-answer.service.ts";

const saveAnswerRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/save-answer",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      body: SaveAnswerBody,
      response: {
        200: SaveAnswerResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof SaveAnswerBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof SaveAnswerResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await saveAnswerService(userId, request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        if (result.statusCode === 403) {
          return reply.forbidden(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.sessions.saveAnswer.success),
        data: result.data,
      });
    },
  });
};

export default saveAnswerRoute;
