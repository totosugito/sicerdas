import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { EnumContentType, EnumContentStatus } from "../../db/schema/enum/enum-app.ts";
import { listVersionService } from "../../modules/version/services/list-version.service.ts";
import { BaseResponseSchema, ErrorResponseSchema, PaginationMetaSchema } from "../../types/response.ts";

const ListVersionBody = Type.Object({
  page: Type.Optional(Type.Number({ default: 1 })),
  limit: Type.Optional(Type.Number({ default: 10 })),
  search: Type.Optional(Type.String()),
  dataType: Type.Optional(Type.Enum(EnumContentType)),
  status: Type.Optional(Type.Enum(EnumContentStatus)),
  sortBy: Type.Optional(Type.String({ default: "createdAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
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

const ListVersionResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(VersionResponseItem),
      meta: PaginationMetaSchema,
    }),
  }),
]);

const listVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Version"],
      body: ListVersionBody,
      response: {
        200: ListVersionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof ListVersionBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListVersionResponse.static> {
      const {
        page = 1,
        limit = 10,
        search,
        dataType,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = request.body;

      const result = await listVersionService({
        page,
        limit,
        search,
        dataType,
        status,
        sortBy,
        sortOrder,
      });

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.version.listSuccess),
        data: result,
      });
    },
  });
};

export default listVersionRoute;
