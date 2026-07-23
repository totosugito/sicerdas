import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import { revokeOtherSessionsService } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

const RevokeOtherSessionsRequest = Type.Object({
  token: Type.String(),
});

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/revoke-other-sessions-v1",
    method: "POST",
    schema: {
      tags: ["User"],
      summary: "Revoke other user sessions",
      description: "Revokes all sessions for the authenticated user except the provided token",
      body: RevokeOtherSessionsRequest,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { token } = request.body as { token: string };
      const userId = request.session.user.id;

      const result = await revokeOtherSessionsService({
        userId,
        token,
      });

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 403) {
          return reply.status(403).send({
            success: false,
            message,
          });
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.auth.sessions_revoked, { count: result.deletedCount }),
      });
    },
  });
};

export default protectedRoute;
