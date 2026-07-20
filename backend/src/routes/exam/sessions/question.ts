import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { QuestionSessionResponse } from "../../../modules/exam/sessions/sessions.schema.ts";
import { questionSessionService } from "../../../modules/exam/sessions/services/question-session.service.ts";

const Params = Type.Object({
  id: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
});

const questionSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/:id/questions/:questionId",
    method: "GET",
    schema: {
      tags: ["Client Exam Sessions"],
      params: Params,
      response: {
        200: QuestionSessionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof Params.static }>,
      reply: FastifyReply,
    ): Promise<typeof QuestionSessionResponse.static> {
      const userId = (request as any).session.user.id;
      const { id: sessionId, questionId } = request.params;
      const result = await questionSessionService(userId, sessionId, questionId);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.sessions.question.success),
        data: result.data,
      });
    },
  });
};

export default questionSessionRoute;
