import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { emailHasOtpService } from "../../modules/auth/services/email-has-otp.service.ts";
import { EmailHasOtpBody, EmailHasOtpResponse } from "../../modules/auth/auth.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

/**
 * Check if user has pending OTP verification
 * 
 * Expected JSON body input parameters:
 * - email: string - User's email address
 * - identifier: string - Optional. Identifier prefix, defaults to 'forget-password-otp-'
 * 
 * @param {string} email - Required. User's email address
 * @param {string} identifier - Optional. Identifier prefix, defaults to 'forget-password-otp-'
 */
const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/email-has-otp",
    method: "POST",
    schema: {
      tags: ["Auth"],
      summary: "Check if user has pending OTP verification",
      description: "Check if user has pending OTP verification in the system. Expected JSON body fields: email, identifier (optional)",
      consumes: ["application/json"],
      body: EmailHasOtpBody,
      response: {
        200: EmailHasOtpResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (req, reply) => {
      const { email, identifier } = req.body;

      if (!email) {
        return reply.badRequest(req.t(($) => $.auth.emailRequired));
      }

      const result = await emailHasOtpService({ email, identifier });

      if (!result.success || result.hasOtp === undefined) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        hasOtp: result.hasOtp,
        message: result.hasOtp
          ? req.t(($) => $.auth.pendingVerificationFound)
          : req.t(($) => $.auth.noPendingVerification),
      });
    },
  });
};

export default publicRoute;