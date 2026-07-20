import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AssignQuestionTagsBody,
} from "../../../../modules/exam/question-tags/question-tags.schema.ts";
import { assignQuestionTagsService } from "../../../../modules/exam/question-tags/services/assign.service.ts";

const assignQuestionTagsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/assign",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Tags"],
      body: AssignQuestionTagsBody,
      response: {
        200: ErrorResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AssignQuestionTagsBody.static }>,
      reply: FastifyReply,
    ) {
      const result = await assignQuestionTagsService(request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_tags.assign.success),
      });
    },
  });
};

export default assignQuestionTagsRoute;
