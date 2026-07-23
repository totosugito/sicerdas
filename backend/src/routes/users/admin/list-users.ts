import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import type { FastifyReply, FastifyRequest } from "fastify";
import {
  listUsersService,
  ListUsersBodySchema,
  type ListUsersBody,
  ListUsersResponseSchema,
} from "../../../modules/users/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const listUsers: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "List users with pagination, search, and filtering",
      body: ListUsersBodySchema,
      response: {
        200: ListUsersResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: ListUsersBody }>,
      reply: FastifyReply,
    ): Promise<typeof ListUsersResponseSchema.static> {
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
