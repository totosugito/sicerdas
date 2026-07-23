import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { updateUserService, UpdateUserBodySchema, UserResponseSchema } from "../../../modules/users/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const updateUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update",
    method: "PATCH",
    schema: {
      tags: ["Users Management"],
      summary: "Update user details (Admin only)",
      body: UpdateUserBodySchema,
      response: {
        200: UserResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof UpdateUserBodySchema.static }>,
      reply: FastifyReply,
    ): Promise<typeof UserResponseSchema.static> {
      // Explicitly destructure for Mass Assignment Protection
      const { id, name, email, role } = request.body;

      const result = await updateUserService({
        id,
        name,
        email,
        role,
      });

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 409) {
          return reply.conflict(message);
        }
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.user.management.update.success),
        data: result.data,
      });
    },
  });
};

export default updateUser;
