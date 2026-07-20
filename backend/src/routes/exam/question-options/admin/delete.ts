import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";
import { deleteQuestionOptionService } from "../../../../modules/exam/question-options/services/delete-question-option.service.ts";
import { QuestionOptionParams } from "../../../../modules/exam/question-options/question-options.schema.ts";

const deleteQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Question Options"],
      params: QuestionOptionParams,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof QuestionOptionParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = request.params;

      const result = await deleteQuestionOptionService(id, request.log);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_options.delete.success),
      });
    },
  });
};

export default deleteQuestionOptionRoute;
