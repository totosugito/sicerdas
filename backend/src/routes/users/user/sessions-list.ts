import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { listSessionsService, SessionListResponseSchema } from "../../../modules/users/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/sessions-list",
    method: "GET",
    schema: {
      tags: ["User"],
      summary: "List user sessions",
      description: "Get a list of all active sessions for the authenticated user",
      response: {
        200: SessionListResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (req, reply) => {
      const userId = req.session.user.id;

      const result = await listSessionsService(userId);

      if (!result.success || !result.data) {
        return reply.badRequest(req.t(result.errorKey!));
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.user.sessionsList.success),
        data: result.data,
      });
    },
  });
};

export default protectedRoute;
