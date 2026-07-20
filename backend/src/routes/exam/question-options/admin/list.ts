import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { listQuestionOptionsService } from "../../../../modules/exam/question-options/services/list-question-options.service.ts";
import {
  QuestionOptionListBody,
  ListQuestionOptionsResponse,
} from "../../../../modules/exam/question-options/question-options.schema.ts";

const listQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Options"],
      body: QuestionOptionListBody,
      response: {
        200: ListQuestionOptionsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof QuestionOptionListBody.static }>,
      reply: FastifyReply,
    ) {
      const result = await listQuestionOptionsService(request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_options.list.success),
        data: result.data,
      });
    },
  });
};

export default listQuestionOptionRoute;
