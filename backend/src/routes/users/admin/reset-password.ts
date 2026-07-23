import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import { resetPasswordService } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const ResetPasswordBody = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to reset password" }),
  newPassword: Type.String({ minLength: 6, description: "New password" }),
});

const resetPassword: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/reset-password",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Reset user password (Admin only)",
      description: "Forcefully reset any user password by ID. Does not require the current password.",
      body: ResetPasswordBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof ResetPasswordBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id, newPassword } = request.body;
      const auth = getAuthInstance(app);

      // Get auth context for password hashing
      const context = await auth.$context;
      const hashedPassword = await context.password.hash(newPassword);

      const result = await resetPasswordService({
        id,
        hashedPassword,
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
        message: request.t(($) => $.user.passwordUpdatedSuccessfully),
      });
    },
  });
};

export default resetPassword;
