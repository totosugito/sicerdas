import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  QuestionTagListBody,
  QuestionTagListResponse,
} from "../../../../modules/exam/question-tags/question-tags.schema.ts";
import { listQuestionTagsService } from "../../../../modules/exam/question-tags/services/list.service.ts";

const listQuestionTagsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Tags"],
      body: QuestionTagListBody,
      response: {
        200: QuestionTagListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof QuestionTagListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof QuestionTagListResponse.static> {
      const result = await listQuestionTagsService(request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_tags.list.success),
        data: result.data,
      });
    },
  });
};

export default listQuestionTagsRoute;
