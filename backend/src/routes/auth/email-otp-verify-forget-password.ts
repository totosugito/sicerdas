import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { verifications } from "../../db/schema/user/index.ts";
import { eq, desc } from "drizzle-orm";

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
    url: '/email-otp-verify-forget-password',
    method: 'POST',
    schema: {
      tags: ['Auth'],
      summary: 'Verify forget password OTP',
      description: 'Verify if a forget password OTP token is valid and not expired. Expected JSON body fields: email, otp',
      consumes: ['application/json'],
      body: Type.Object({
        email: Type.String({ format: 'email' }),
        otp: Type.String()
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean({ default: true }),
          message: Type.String(),
          data: Type.Object({
            valid: Type.Boolean()
          })
        }),
        // Updated to use proper HTTP status codes with Fastify Sensible
        '4xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        }),
        '5xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        })
      }
    },
    handler: withErrorHandler(async (req, reply) => {
      const { email, otp } = req.body as { email: string; otp: string };

      // Validate required fields using Fastify Sensible badRequest
      if (!email) {
        return reply.badRequest(req.i18n.t('auth.emailRequired'));
      }

      if (!otp) {
        return reply.badRequest(req.i18n.t('auth.otpRequired'));
      }

      // Check if token exists in verifications table and is not expired
      // Based on the example data, the identifier format is "forget-password-otp-{email}"
      // and the value contains the OTP token
      const verificationResult = await db
        .select()
        .from(verifications)
        .where(
          eq(verifications.identifier, `forget-password-otp-${email}`)
        )
        .orderBy(desc(verifications.updatedAt));

      if (verificationResult.length === 0) {
        return reply.notFound(req.i18n.t('auth.invalidOTP'));
      }

      const verification = verificationResult[0];

      // Check if token matches
      // The database stores the token in format "token:something" (e.g., "591255:0"), but the user sends just "591255"
      // So we need to check if the stored value starts with the provided otp followed by ":"
      if (!verification.value.startsWith(`${otp}:`)) {
        return reply.notFound(req.i18n.t('auth.invalidOTP'));
      }

      // Check if token is expired
      const now = new Date();
      const isExpired = verification.expiresAt < now;

      if (isExpired) {
        return reply.notFound(req.i18n.t('auth.expiredOTP'));
      }

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('auth.validOTP'),
        data: {
          valid: true
        }
      });
    }),
  });
};

export default publicRoute;