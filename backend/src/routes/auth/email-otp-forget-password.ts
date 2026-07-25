import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { emailOtpForgetPasswordService } from "../../modules/auth/services/email-otp-forget-password.service.ts";
import { EmailOtpForgetPasswordBody } from "../../modules/auth/auth.schema.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../types/response.ts";

/**
 * Request forget password OTP via email
 *
 * Expected JSON body input parameters:
 * - email: string - User's email address
 *
 * @param {string} email - Required. User's email address
 */
const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/email-otp-forget-password",
    method: "POST",
    schema: {
      tags: ["Auth"],
      summary: "Request forget password OTP",
      description: "Send forget password OTP email to user. Expected JSON body field: email",
      consumes: ["application/json"],
      body: EmailOtpForgetPasswordBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },

    handler: async (req, reply) => {
      const { email } = req.body;

      if (!email) {
        return reply.badRequest(req.t(($) => $.auth.emailRequired));
      }

      // 1. Call the service for validation checks (user exist, provider checks, rate limit)
      const result = await emailOtpForgetPasswordService({ email });

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      // 2. Call the better-auth internal API via app.inject
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/email-otp/request-password-reset",
        payload: JSON.stringify({
          email: email,
        }),
        headers: {
          "content-type": "application/json",
          "accept-language": req.headers["accept-language"] || "id",
        },
      });

      const success = response.statusCode >= 200 && response.statusCode < 300;

      return reply.status(response.statusCode).send({
        success,
        message: success
          ? req.t(($) => $.auth.passwordResetOTPSent)
          : req.t(($) => $.auth.passwordResetOTPFailed),
      });
    },
  });
};

export default publicRoute;

