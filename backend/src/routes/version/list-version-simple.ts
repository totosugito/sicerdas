import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { EnumContentType } from "../../db/schema/enum/enum-app.ts";
import { listVersionSimpleService } from "../../modules/version/services/list-version-simple.service.ts";
import { ErrorResponseSchema, PaginationMetaSchema } from "../../types/response.ts";

const VersionSimpleQuery = Type.Object({
  dataType: Type.Enum(EnumContentType),
  search: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

const VersionSimpleResponseItem = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  published: Type.Boolean(),
});

const ListVersionSimpleResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(VersionSimpleResponseItem),
    meta: PaginationMetaSchema,
  }),
});

const listVersionSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Version"],
      body: VersionSimpleQuery,
      response: {
        200: ListVersionSimpleResponse,
        "4xx": ErrorResponseSchema,
        "5xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof VersionSimpleQuery.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListVersionSimpleResponse.static> {
      const { dataType, search, page = 1, limit = 1000 } = request.body;

      const result = await listVersionSimpleService({
        dataType,
        search,
        page,
        limit,
      });

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.version.listSuccess),
        data: result,
      });
    },
  });
};

export default listVersionSimpleRoute;
