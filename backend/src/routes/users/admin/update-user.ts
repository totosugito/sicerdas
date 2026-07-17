import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { EnumUserRole } from "../../../db/schema/user/index.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import { updateUserService } from "../../../modules/user/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const UpdateBody = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to update" }),
  name: Type.Optional(Type.String({ description: "New full name" })),
  email: Type.Optional(Type.String({ format: "email", description: "New email address" })),
  role: Type.Optional(Type.Enum(EnumUserRole, { description: "New user role" })),
});

const UpdateResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Optional(Type.Any()),
  }),
]);

const updateUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update",
    method: "PATCH",
    schema: {
      tags: ["Users Management"],
      summary: "Update user details (Admin only)",
      body: UpdateBody,
      response: {
        200: UpdateResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof UpdateBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof UpdateResponse.static> {
      // Explicitly destructure for Mass Assignment Protection
      const { id, name, email, role } = req.body;

      const result = await updateUserService({
        id,
        name,
        email,
        role,
      });

      if (!result.success) {
        const message = req.t(result.errorKey!);
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
        message: req.t(($) => $.user.management.update.success),
        data: result.data,
      });
    },
  });
};

export default updateUser;
