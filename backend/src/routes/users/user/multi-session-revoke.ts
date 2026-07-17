import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import { revokeSessionService } from "../../../modules/user/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const RevokeSessionRequest = Type.Object({
  sessionToken: Type.String({ description: "The token of the session to revoke" }),
});

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/multi-session-revoke",
    method: "POST",
    schema: {
      tags: ["User"],
      summary: "Revoke a user session",
      description: "Revokes a specific session by its token for the authenticated user",
      body: RevokeSessionRequest,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (req, reply) => {
      const userId = req.session.user.id;
      const { sessionToken } = req.body as { sessionToken: string };

      const result = await revokeSessionService({
        userId,
        sessionToken,
      });

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        if (result.statusCode === 403) {
          return reply.forbidden(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.user.sessions.sessionRevoked),
      });
    },
  });
};

export default protectedRoute;
