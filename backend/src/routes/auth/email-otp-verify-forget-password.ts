import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { emailOtpVerifyForgetPasswordService } from "../../modules/auth/services/email-otp-verify-forget-password.service.ts";
import {
  EmailOtpVerifyForgetPasswordBody,
  EmailOtpVerifyForgetPasswordResponse,
} from "../../modules/auth/auth.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

/**
 * Verify forget password OTP
 * 
 * Expected JSON body input parameters:
 * - email: string - User's email address
 * - otp: string - OTP token to validate
 * 
 * @param {string} email - Required. User's email address
 * @param {string} otp - Required. OTP token to validate
 */
const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/email-otp-verify-forget-password",
    method: "POST",
    schema: {
      tags: ["Auth"],
      summary: "Verify forget password OTP",
      description: "Verify if a forget password OTP token is valid and not expired. Expected JSON body fields: email, otp",
      consumes: ["application/json"],
      body: EmailOtpVerifyForgetPasswordBody,
      response: {
        200: EmailOtpVerifyForgetPasswordResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (req, reply) => {
      const { email, otp } = req.body;

      if (!email) {
        return reply.badRequest(req.t(($) => $.auth.emailRequired));
      }

      if (!otp) {
        return reply.badRequest(req.t(($) => $.auth.otpRequired));
      }

      const result = await emailOtpVerifyForgetPasswordService({ email, otp });

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.auth.validOTP),
        data: result.data,
      });
    },
  });
};

export default publicRoute;