import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { Type } from "@fastify/type-provider-typebox";
import { changePasswordService } from "../../../modules/user/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/change-password",
    method: "PUT",
    schema: {
      tags: ["User"],
      summary: "Change user password",
      description: "Change the current user password. Expected JSON body fields: currentPassword, newPassword",
      consumes: ["application/json"],
      body: Type.Object({
        currentPassword: Type.String({
          description: "Current password",
          minLength: 1,
        }),
        newPassword: Type.String({
          description: "New password",
          minLength: 6,
        }),
      }),
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (req, reply) => {
      const auth = getAuthInstance(app);
      const { currentPassword, newPassword } = req.body as {
        currentPassword: string;
        newPassword: string;
      };

      if (!currentPassword) {
        return reply.badRequest(req.t(($) => $.user.currentPasswordRequired));
      }

      if (!newPassword) {
        return reply.badRequest(req.t(($) => $.user.newPasswordRequired));
      }

      const userId = req.session.user.id;
      const context = await auth.$context;

      const result = await changePasswordService({
        userId,
        currentPassword,
        newPassword,
        verifyFn: async (password, hash) => {
          return context.password.verify({ password, hash });
        },
        hashFn: async (password) => {
          return context.password.hash(password);
        },
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
        message: req.t(($) => $.user.passwordUpdatedSuccessfully),
      });
    },
  });
};

export default protectedRoute;
