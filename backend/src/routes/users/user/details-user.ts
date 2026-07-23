import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { getUserDetailsService, UserDetailsResponseSchema, type GetUserDetailsResponse } from "../../../modules/users/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/details",
    method: "GET",
    schema: {
      tags: ["User"],
      summary: "Get current user details",
      description: "Get the authenticated user's profile information",
      response: {
        200: UserDetailsResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      // Get user ID from session (already verified by user.hook.ts)
      const userId = request.session.user.id;

      const result: GetUserDetailsResponse = await getUserDetailsService(userId);

      if (!result.success || !result.data) {
        return reply.notFound(request.t(result.errorKey!));
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.user.management.details.success),
        data: result.data as any,
      });
    },
  });
};

export default protectedRoute;
