import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from "better-auth/node";
import { banUserService } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const BanBody = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to ban/unban" }),
  banned: Type.Boolean({ description: "True to ban, false to unban" }),
  banReason: Type.Optional(Type.String({ description: "Reason for the ban" })),
});

const banUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/ban",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Ban or unban a user (Admin only)",
      body: BanBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof BanBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id, banned, banReason } = req.body;

      // Determine user role from session
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      const adminId = session?.user?.id;

      const result = await banUserService({
        id,
        banned,
        banReason,
        adminId,
      });

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.user.management.update.success),
      });
    },
  });
};

export default banUser;
