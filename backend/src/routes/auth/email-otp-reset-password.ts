import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { emailOtpResetPasswordService, deleteOtpVerificationService } from "../../modules/auth/services/email-otp-reset-password.service.ts";
import { EmailOtpResetPasswordBody } from "../../modules/auth/auth.schema.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../types/response.ts";

/**
 * Reset password using email OTP
 * 
 * Expected JSON body input parameters:
 * - email: string - User's email address
 * - otp: string - OTP token for verification
 * - password: string - New password for the user
 * 
 * @param {string} email - Required. User's email address
 * @param {string} otp - Required. OTP token for verification
 * @param {string} password - Required. New password for the user
 */
const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/email-otp-reset-password',
    method: 'POST',
    schema: {
      tags: ['Auth'],
      summary: 'Reset password with email OTP',
      description: 'Reset user password using email, OTP and new password. Expected JSON body fields: email, otp, password',
      consumes: ['application/json'],
      body: EmailOtpResetPasswordBody,
      response: {
        200: BaseResponseSchema,
        '4xx': ErrorResponseSchema,
      }
    },
    handler: async (req, reply) => {
      const { email, otp, password } = req.body;

      if (!email) {
        return reply.badRequest(req.t($ => $.auth.emailRequired));
      }

      if (!otp) {
        return reply.badRequest(req.t($ => $.auth.otpRequired));
      }

      if (!password) {
        return reply.badRequest(req.t($ => $.auth.passwordRequired));
      }

      // 1. Call the service for validation checks (user existence)
      const result = await emailOtpResetPasswordService({ email, otp, password });

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      // 2. Use Fastify's built-in inject method to call the better-auth API
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/email-otp/reset-password',
        payload: JSON.stringify({
          email,
          otp,
          password
        }),
        headers: {
          'content-type': 'application/json',
          'accept-language': req.headers['accept-language'] || 'id',
        }
      });

      // Check if the response was successful
      const isSuccessful = response.statusCode >= 200 && response.statusCode < 300;

      // If successful, delete the verification records for this email
      if (isSuccessful) {
        await deleteOtpVerificationService(email);
      }

      // Forward the response
      return reply
        .status(response.statusCode)
        .headers(response.headers)
        .send({
          success: isSuccessful,
          message: isSuccessful
            ? req.t($ => $.auth.passwordResetSuccess)
            : req.t($ => $.auth.passwordResetFailed)
        });
    },
  });
};

export default publicRoute;
