import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { listQuestionSolutionsService } from "../../../../modules/exam/question-solutions/services/list-question-solutions.service.ts";
import {
  QuestionSolutionListBody,
  ListQuestionSolutionsResponse,
} from "../../../../modules/exam/question-solutions/question-solutions.schema.ts";

const listQuestionSolutionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Solutions"],
      body: QuestionSolutionListBody,
      response: {
        200: ListQuestionSolutionsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof QuestionSolutionListBody.static }>,
      reply: FastifyReply,
    ) {
      const result = await listQuestionSolutionsService(request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_solutions.list.success),
        data: result.data,
      });
    },
  });
};

export default listQuestionSolutionRoute;
