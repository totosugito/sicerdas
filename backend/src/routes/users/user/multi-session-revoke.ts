import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { revokeSessionService, RevokeSessionBodySchema, type RevokeSessionBody } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/multi-session-revoke",
    method: "POST",
    schema: {
      tags: ["User"],
      summary: "Revoke a user session",
      description: "Revokes a specific session by its token for the authenticated user",
      body: RevokeSessionBodySchema,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.session.user.id;
      const { sessionToken } = request.body as RevokeSessionBody;

      const result = await revokeSessionService({
        userId,
        sessionToken,
      });

      if (!result.success) {
        const message = request.t(result.errorKey!);
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
        message: request.t(($) => $.user.sessions.sessionRevoked),
      });
    },
  });
};

export default protectedRoute;
