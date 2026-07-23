import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { EnumUserRole } from "../../../db/schema/user/index.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listUsersService, UserResponseItemSchema } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema, PaginationMetaSchema } from "../../../types/response.ts";

const ListBody = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: Type.Optional(Type.String({ description: "Search term for name or email" })),
  roles: Type.Optional(
    Type.Array(Type.Enum(EnumUserRole), { description: "Filter by multiple user roles" }),
  ),
  sortBy: Type.Optional(
    Type.String({
      default: "createdAt",
      description: "Sort field: createdAt, name, email, role, updatedAt",
    }),
  ),
  sortOrder: Type.Optional(
    Type.String({ description: "Sort order: asc or desc", default: "desc" }),
  ),
});

const ListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(UserResponseItemSchema),
      meta: PaginationMetaSchema,
    }),
  }),
]);

const listUsers: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "List users with pagination, search, and filtering",
      body: ListBody,
      response: {
        200: ListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof ListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListResponse.static> {
      const {
        page = 1,
        limit = 10,
        search,
        roles,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = request.body;

      const result = await listUsersService({
        page,
        limit,
        search,
        roles,
        sortBy,
        sortOrder,
      });

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.user.management.list.success),
        data: result,
      });
    },
  });
};

export default listUsers;
