import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import { getUserDetailsService } from "../../../modules/user/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const DetailsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      id: Type.String({ format: "uuid" }),
      email: Type.String({ format: "email" }),
      name: Type.Union([Type.String(), Type.Null()]),
      image: Type.Union([Type.String({ format: "uri" }), Type.Null()]),
      emailVerified: Type.Boolean(),
      school: Type.Union([Type.String(), Type.Null()]),
      educationLevel: Type.Union([Type.String(), Type.Null()]),
      grade: Type.Union([Type.String(), Type.Null()]),
      phone: Type.Union([Type.String(), Type.Null()]),
      address: Type.Union([Type.String(), Type.Null()]),
      bio: Type.Union([Type.String(), Type.Null()]),
      dateOfBirth: Type.Union([Type.String(), Type.Null()]),
      createdAt: Type.String({ format: "date-time" }),
      updatedAt: Type.String({ format: "date-time" }),
      providerId: Type.String(),
      extra: Type.Object({}, { additionalProperties: true }),
    }),
  }),
]);

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/details",
    method: "GET",
    schema: {
      tags: ["User"],
      summary: "Get current user details",
      description: "Get the authenticated user's profile information",
      response: {
        200: DetailsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (req, reply) => {
      // Get user ID from session (already verified by user.hook.ts)
      const userId = req.session.user.id;

      const result = await getUserDetailsService(userId);

      if (!result.success || !result.data) {
        return reply.notFound(req.t(result.errorKey!));
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.user.management.details.success),
        data: result.data as any,
      });
    },
  });
};

export default protectedRoute;
