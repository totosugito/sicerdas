import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  QuestionParams,
  GetQuestionResponse,
} from "../../../../modules/exam/questions/questions.schema.ts";
import { detailQuestionService } from "../../../../modules/exam/questions/services/detail-question.service.ts";

const getQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Admin Exam Questions"],
      params: QuestionParams,
      response: {
        200: GetQuestionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof QuestionParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof GetQuestionResponse.static> {
      const result = await detailQuestionService(request.params.id);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.questions.list.success),
        data: result.data,
      });
    },
  });
};

export default getQuestionRoute;
