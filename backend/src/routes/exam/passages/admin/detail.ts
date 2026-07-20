import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { detailPassageService } from "../../../../modules/exam/passages/services/detail-passage.service.ts";
import {
  PassageParams,
  PassageDetailResponse,
} from "../../../../modules/exam/passages/passages.schema.ts";

const detailPassageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Admin Exam Passages"],
      params: PassageParams,
      response: {
        200: PassageDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof PassageParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = request.params;

      const result = await detailPassageService(id);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.passages.list.success),
        data: result.data,
      });
    },
  });
};

export default detailPassageRoute;
