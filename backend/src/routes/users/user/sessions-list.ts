import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import { listSessionsService } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const SessionListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(
      Type.Object({
        id: Type.String({ format: "uuid" }),
        expiresAt: Type.String({ format: "date-time" }),
        createdAt: Type.String({ format: "date-time" }),
        updatedAt: Type.String({ format: "date-time" }),
        ipAddress: Type.Union([Type.String(), Type.Null()]),
        userAgent: Type.Union([Type.String(), Type.Null()]),
        token: Type.String(),
      }),
    ),
  }),
]);

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/sessions-list",
    method: "GET",
    schema: {
      tags: ["User"],
      summary: "List user sessions",
      description: "Get a list of all active sessions for the authenticated user",
      response: {
        200: SessionListResponse,
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
