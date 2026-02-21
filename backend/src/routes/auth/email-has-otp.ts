import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { users, verifications } from "../../db/schema/auth-schema.ts";
import { eq, and, gte } from "drizzle-orm";

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
    url: '/email-has-otp',
    method: 'POST',
    schema: {
      tags: ['Auth'],
      summary: 'Check if user has pending OTP verification',
      description: 'Check if user has pending OTP verification in the system. Expected JSON body fields: email, identifier (optional)',
      consumes: ['application/json'],
      body: Type.Object({
        email: Type.String({ format: 'email' }),
        identifier: Type.Optional(Type.String())
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean({ default: true }),
          hasOtp: Type.Boolean(),
          message: Type.String(),
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
      // Extract email and identifier from request body, default identifier to 'forget-password-otp-' if not provided
      const { email, identifier: identifierPrefix = 'forget-password-otp-' } = req.body as { email: string; identifier?: string; };

      // Validate required fields using Fastify Sensible badRequest
      if (!email) {
        return reply.badRequest(req.i18n.t('auth.emailRequired'));
      }

      // Check if email exists in users table and get user ID
      const existingUser = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email));

      if (existingUser.length === 0) {
        return reply.notFound(req.i18n.t('auth.userNotFound'));
      }

      // Check if user has pending verification in the verifications table
      // We'll look for verifications with identifier "{identifierPrefix}{email}" that haven't expired yet
      const identifier = `${identifierPrefix}${email}`;

      const pendingVerifications = await db
        .select()
        .from(verifications)
        .where(
          and(
            eq(verifications.identifier, identifier), // Check for the specific identifier format
            gte(verifications.expiresAt, new Date()) // Check if verification hasn't expired yet
          )
        );

      // Check if there are any pending verifications that haven't expired
      const hasOtp = pendingVerifications.length > 0;

      return reply
        .status(200)
        .send({
          success: true,
          hasOtp: hasOtp,
          message: hasOtp
            ? req.i18n.t('auth.pendingVerificationFound')
            : req.i18n.t('auth.noPendingVerification')
        });
    }),
  });
};

export default publicRoute;