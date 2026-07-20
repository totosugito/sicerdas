import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  QuestionListBody,
  ListQuestionsResponse,
} from "../../../../modules/exam/questions/questions.schema.ts";
import { listQuestionService } from "../../../../modules/exam/questions/services/list-question.service.ts";

const listQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Admin Exam Questions"],
      body: QuestionListBody,
      response: {
        200: ListQuestionsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof QuestionListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListQuestionsResponse.static> {
      const result = await listQuestionService(request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
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

export default listQuestionRoute;
