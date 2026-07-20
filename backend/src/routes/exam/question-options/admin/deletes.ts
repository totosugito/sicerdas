import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";
import { deletesQuestionOptionsService } from "../../../../modules/exam/question-options/services/deletes-question-options.service.ts";
import { DeleteMultipleQuestionOptionsBody } from "../../../../modules/exam/question-options/question-options.schema.ts";

const deleteMultipleQuestionOptionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/deletes",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Options"],
      body: DeleteMultipleQuestionOptionsBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof DeleteMultipleQuestionOptionsBody.static }>,
      reply: FastifyReply,
    ) {
      const { ids } = request.body;

      const result = await deletesQuestionOptionsService(ids);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_options.delete.successMultiple),
      });
    },
  });
};

export default deleteMultipleQuestionOptionsRoute;
