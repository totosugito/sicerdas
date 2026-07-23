import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserService } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const Params = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to delete" }),
});

const deleteUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Users Management"],
      summary: "Delete a user (Admin only)",
      params: Params,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof Params.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id } = request.params;

      // Prevent self-deletion
      if (id === request.session.user.id) {
        return reply.badRequest(request.t(($) => $.user.errors.accessDenied));
      }

      const result = await deleteUserService({ id, logger: request.log });

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

export default deleteUser;
