import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";
import { deletesQuestionSolutionsService } from "../../../../modules/exam/question-solutions/services/deletes-question-solutions.service.ts";
import { DeleteMultipleQuestionSolutionsBody } from "../../../../modules/exam/question-solutions/question-solutions.schema.ts";

const deleteMultipleQuestionSolutionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/deletes",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Solutions"],
      body: DeleteMultipleQuestionSolutionsBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof DeleteMultipleQuestionSolutionsBody.static }>,
      reply: FastifyReply,
    ) {
      const { ids } = request.body;

      const result = await deletesQuestionSolutionsService(ids);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_solutions.delete.successMultiple),
      });
    },
  });
};

export default deleteMultipleQuestionSolutionsRoute;
