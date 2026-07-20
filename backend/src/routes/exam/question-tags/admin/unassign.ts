import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  UnassignQuestionTagsBody,
} from "../../../../modules/exam/question-tags/question-tags.schema.ts";
import { unassignQuestionTagsService } from "../../../../modules/exam/question-tags/services/unassign.service.ts";

const unassignQuestionTagsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/unassign",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Tags"],
      body: UnassignQuestionTagsBody,
      response: {
        200: ErrorResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof UnassignQuestionTagsBody.static }>,
      reply: FastifyReply,
    ) {
      const result = await unassignQuestionTagsService(request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_tags.unassign.success),
      });
    },
  });
};

export default unassignQuestionTagsRoute;
