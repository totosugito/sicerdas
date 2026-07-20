import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { detailVersionService } from "../../../modules/version/services/admin/detail-version.service.ts";
import { VersionResponse } from "../../../modules/version/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const DetailVersionParams = Type.Object({
  id: Type.Number(),
});

const detailVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Version"],
      params: DetailVersionParams,
      response: {
        200: VersionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof DetailVersionParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof VersionResponse.static> {
      const { id } = request.params;

      const result = await detailVersionService(id);

      if (!result.success || !result.data) {
        return reply.notFound(request.t(result.errorKey!));
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.version.detailSuccess),
        data: result.data,
      });
    },
  });
};

export default detailVersionRoute;
