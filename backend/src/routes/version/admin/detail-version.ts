import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { detailVersionService } from "../../../modules/version/services/detail-version.service.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const DetailVersionParams = Type.Object({
  id: Type.Number(),
});

const VersionResponseItem = Type.Object({
  id: Type.Number(),
  appVersion: Type.Number(),
  dbVersion: Type.Number(),
  dataType: Type.String(),
  status: Type.String(),
  name: Type.String(),
  note: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  extra: Type.Record(Type.String(), Type.Unknown()),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const DetailVersionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: VersionResponseItem,
});

const detailVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Version"],
      params: DetailVersionParams,
      response: {
        200: DetailVersionResponse,
        "4xx": ErrorResponseSchema,
        "5xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof DetailVersionParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof DetailVersionResponse.static> {
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
