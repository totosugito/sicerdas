import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { changePasswordService, ChangePasswordBodySchema, type ChangePasswordBody } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema, type ServiceResponse } from "../../../types/response.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/change-password",
    method: "PUT",
    schema: {
      tags: ["User"],
      summary: "Change user password",
      description: "Change the current user password. Expected JSON body fields: currentPassword, newPassword",
      consumes: ["application/json"],
      body: ChangePasswordBodySchema,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const auth = getAuthInstance(app);
      const { currentPassword, newPassword } = request.body as ChangePasswordBody;

      if (!currentPassword) {
        return reply.badRequest(request.t(($) => $.user.currentPasswordRequired));
      }

      if (!newPassword) {
        return reply.badRequest(request.t(($) => $.user.newPasswordRequired));
      }

      const userId = request.session.user.id;
      const context = await auth.$context;

      const result: ServiceResponse = await changePasswordService({
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
        message: request.t(($) => $.user.passwordUpdatedSuccessfully),
      });
    },
  });
};

export default protectedRoute;
