import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserService, BulkDeleteUsersBodySchema, type BulkDeleteUsersBody } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const bulkDeleteUsers: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/deletes",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Bulk delete users (Admin only)",
      body: BulkDeleteUsersBodySchema,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: BulkDeleteUsersBody }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { ids } = request.body;

      const result = await deleteUserService({ ids, logger: request.log });

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.user.management.delete.success),
      });
    },
  });
};

export default bulkDeleteUsers;
