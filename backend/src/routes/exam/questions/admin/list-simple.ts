import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  QuestionListSimpleBody,
  ListSimpleQuestionsResponse,
} from "../../../../modules/exam/questions/questions.schema.ts";
import { listQuestionSimpleService } from "../../../../modules/exam/questions/services/list-question-simple.service.ts";

const listSimpleQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Admin Exam Questions"],
      body: QuestionListSimpleBody,
      response: {
        200: ListSimpleQuestionsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof QuestionListSimpleBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListSimpleQuestionsResponse.static> {
      const result = await listQuestionSimpleService(request.body);

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

export default listSimpleQuestionRoute;
