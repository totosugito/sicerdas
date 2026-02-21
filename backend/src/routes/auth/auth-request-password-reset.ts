import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { users, verifications } from "../../db/schema/user/index.ts";
import { eq, and, gte, count } from "drizzle-orm";
import { CONFIG } from "../../config/app-constant.ts";

/**
 * Request password reset
 * 
 * Expected JSON body input parameters:
 * - email: string - User's email address
 * - redirectTo: string (optional) - URL to redirect after password reset
 * 
 * @param {string} email - Required. User's email address
 * @param {string} [redirectTo] - Optional. URL to redirect after password reset
 */
const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/auth-request-password-reset',
    method: 'POST',
    schema: {
      tags: ['Auth'],
      summary: 'Request password reset',
      description: 'Send password reset email to user. Expected JSON body fields: email, redirectTo (optional)',
      consumes: ['application/json'],
      body: Type.Object({
        email: Type.String({ format: 'email' }),
        redirectTo: Type.Optional(Type.String())
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
      const { email, redirectTo } = req.body as { email: string; redirectTo?: string };

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
        url: '/api/auth/request-password-reset',
        payload: JSON.stringify({
          email: email,
          redirectTo: redirectTo || '/reset-password'
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
            ? req.i18n.t('auth.passwordResetEmailSent')
            : req.i18n.t('auth.passwordResetFailed')
        });
    }),
  });
};

export default publicRoute;