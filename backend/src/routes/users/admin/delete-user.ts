import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserService } from "../../../modules/user/index.ts";
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
      req: FastifyRequest<{ Params: typeof Params.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.session.user.id) {
        return reply.badRequest(req.t(($) => $.user.errors.accessDenied));
      }

      const result = await deleteUserService({ id, logger: req.log });

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

export default deleteUser;
