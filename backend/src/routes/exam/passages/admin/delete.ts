import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";
import { deletePassageService } from "../../../../modules/exam/passages/services/delete-passage.service.ts";
import { PassageParams } from "../../../../modules/exam/passages/passages.schema.ts";

const deletePassageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Passages"],
      params: PassageParams,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof PassageParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = request.params;

      const result = await deletePassageService(id, request.log);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.passages.delete.success),
      });
    },
  });
};

export default deletePassageRoute;
