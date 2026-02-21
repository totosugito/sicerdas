import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { users, verifications, accounts } from "../../db/schema/auth-schema.ts";
import { eq, and, gte, count } from "drizzle-orm";
import { CONFIG } from "../../config/app-constant.ts";

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
    url: '/email-otp-forget-password',
    method: 'POST',
    schema: {
      tags: ['Auth'],
      summary: 'Request forget password OTP',
      description: 'Send forget password OTP email to user. Expected JSON body field: email',
      consumes: ['application/json'],
      body: Type.Object({
        email: Type.String({ format: 'email' })
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean({ default: true }),
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
      // Extract data directly from request body for JSON input
      const { email } = req.body as { email: string };

      // Validate required fields using Fastify Sensible badRequest
      if (!email) {
        return reply.badRequest(req.i18n.t('auth.emailRequired'));
      }

      // Check if email exists in users table and get user ID
      const existingUser = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email));

      if (existingUser.length === 0) {
        return reply.notFound(req.i18n.t('auth.userNotFound'));
      }

      const userId = existingUser[0].id;

      // Check if the user's account has providerId "credential" or "email"
      const userAccounts = await db.select({ providerId: accounts.providerId }).from(accounts).where(eq(accounts.userId, userId));

      // If no accounts found or if any account has providerId "credential" or "email", return 404
      const hasCredentialOrEmailProvider = userAccounts.some(account =>
        account.providerId !== 'credential' && account.providerId !== 'email'
      );

      if (userAccounts.length === 0 || hasCredentialOrEmailProvider) {
        return reply.notFound(req.i18n.t('auth.userNotFound'));
      }

      // Rate limiting: Check if user has made more than N requests in the last hour
      const ONE_HOUR_AGO = new Date(Date.now() - CONFIG.PASSWORD_RESET_RATE_LIMIT_WINDOW_MS);

      // Count password reset requests for this user ID in the last hour
      // We'll look for verifications with value = userId and createdAt within last hour
      const requestCountResult = await db
        .select({ count: count() })
        .from(verifications)
        .where(
          and(
            eq(verifications.value, userId),
            gte(verifications.createdAt, ONE_HOUR_AGO)
          )
        );

      const requestCount = requestCountResult[0]?.count || 0;

      if (requestCount >= CONFIG.PASSWORD_RESET_RATE_LIMIT) {
        return reply.tooManyRequests(req.i18n.t('auth.passwordResetRateLimitExceeded'));
      }

      // Use Fastify's built-in inject method to call the better-auth API
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/forget-password/email-otp',
        payload: JSON.stringify({
          email: email
        }),
        headers: {
          'content-type': 'application/json',
          'accept-language': req.headers['accept-language'] || 'id',
        }
      });

      // Forward the response
      return reply
        .status(response.statusCode)
        .headers(response.headers)
        .send({
          success: response.statusCode >= 200 && response.statusCode < 300,
          message: response.statusCode >= 200 && response.statusCode < 300
            ? req.i18n.t('auth.passwordResetOTPSent')
            : req.i18n.t('auth.passwordResetOTPFailed')
        });
    }),
  });
};

export default publicRoute;