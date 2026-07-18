import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyRequest, FastifyReply } from "fastify";
import { Type } from "@sinclair/typebox";
import { detailModelService } from "../../../../modules/ai/services/detail-model.service.ts";
import { DetailModelResponse } from "../../../../modules/ai/ai.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const detailsModelAiRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/model/:id",
    method: "GET",
    schema: {
      tags: ["Chat AI"],
      params: Type.Object({ id: Type.String() }),
      response: {
        200: DetailModelResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ): Promise<typeof DetailModelResponse.static> {
      const { id } = req.params;
      const result = await detailModelService(id);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.chatAi.model.detail.success),
        data: result.data,
      });
    },
  });
};

export default detailsModelAiRoute;
