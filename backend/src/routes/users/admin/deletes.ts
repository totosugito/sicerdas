import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserService } from "../../../modules/user/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const DeletesBody = Type.Object({
  ids: Type.Array(Type.String({ format: "uuid" }), {
    minItems: 1,
    description: "List of User IDs to delete",
  }),
});

const bulkDeleteUsers: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/deletes",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Bulk delete users (Admin only)",
      body: DeletesBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof DeletesBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { ids } = req.body;

      const result = await deleteUserService({ ids, logger: req.log });

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.user.management.delete.success),
      });
    },
  });
};

export default bulkDeleteUsers;
