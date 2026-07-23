import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import { resetPasswordService, ResetPasswordBodySchema, type ResetPasswordBody } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const resetPassword: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/reset-password",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Reset user password (Admin only)",
      description: "Forcefully reset any user password by ID. Does not require the current password.",
      body: ResetPasswordBodySchema,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: ResetPasswordBody }>,
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
