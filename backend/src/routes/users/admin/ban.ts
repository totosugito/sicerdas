import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { banUserService, BanUserBodySchema, type BanUserBody } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const banUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/ban",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Ban or unban a user (Admin only)",
      body: BanUserBodySchema,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: BanUserBody }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id, banned, banReason } = request.body;

      // User ID is available from the session (handled by user.hook.ts)
      const adminId = request.session.user.id;

      const result = await banUserService({
        id,
        banned,
        banReason,
        adminId,
      });

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.user.management.update.success),
      });
    },
  });
};

export default banUser;
