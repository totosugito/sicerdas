import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AssignQuestionTagsByNameBody,
} from "../../../../modules/exam/question-tags/question-tags.schema.ts";
import { assignQuestionTagsByNameService } from "../../../../modules/exam/question-tags/services/assign-by-names.service.ts";

const assignQuestionTagsByNameRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/assign-by-names",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Tags"],
      body: AssignQuestionTagsByNameBody,
      response: {
        200: ErrorResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AssignQuestionTagsByNameBody.static }>,
      reply: FastifyReply,
    ) {
      const result = await assignQuestionTagsByNameService(request.body);

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

export default assignQuestionTagsByNameRoute;
