import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";
import { deleteQuestionSolutionService } from "../../../../modules/exam/question-solutions/services/delete-question-solution.service.ts";
import { QuestionSolutionParams } from "../../../../modules/exam/question-solutions/question-solutions.schema.ts";

const deleteQuestionSolutionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Question Solutions"],
      params: QuestionSolutionParams,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof QuestionSolutionParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = request.params;

      const result = await deleteQuestionSolutionService(id, request.log);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_solutions.delete.success),
      });
    },
  });
};

export default deleteQuestionSolutionRoute;
