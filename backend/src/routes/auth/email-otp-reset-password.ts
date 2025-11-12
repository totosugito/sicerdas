import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import {withErrorHandler} from "../../utils/withErrorHandler.ts";
import {db} from "../../db/index.ts";
import {users, verifications} from "../../db/schema/auth-schema.ts";
import {eq, and, gte, count} from "drizzle-orm";
import {PASSWORD_RESET_RATE_LIMIT, PASSWORD_RESET_RATE_LIMIT_WINDOW_MS} from "../../config/app-constant.ts";

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
      body: Type.Object({
        email: Type.String({ format: 'email' }),
        otp: Type.String(),
        password: Type.String()
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
      const { email, otp, password } = req.body as { email: string; otp: string; password: string };

      // Validate required fields using Fastify Sensible badRequest
      if (!email) {
        return reply.badRequest(req.i18n.t('auth.emailRequired'));
      }

      if (!otp) {
        return reply.badRequest(req.i18n.t('auth.tokenRequired'));
      }

      if (!password) {
        return reply.badRequest(req.i18n.t('auth.passwordRequired'));
      }

      // Check if email exists in users table and get user ID
      const existingUser = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email));
      
      if (existingUser.length === 0) {
        return reply.notFound(req.i18n.t('auth.userNotFound'));
      }

      const userId = existingUser[0].id;

      // Rate limiting: Check if user has made more than N requests in the last hour
      const ONE_HOUR_AGO = new Date(Date.now() - PASSWORD_RESET_RATE_LIMIT_WINDOW_MS);

      // Count password reset requests for this user ID in the last hour
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

      if (requestCount >= PASSWORD_RESET_RATE_LIMIT) {
        return reply.tooManyRequests(req.i18n.t('auth.passwordResetRateLimitExceeded'));
      }

      // Use Fastify's built-in inject method to call the better-auth API
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/email-otp/reset-password',
        payload: JSON.stringify({
          email: email,
          otp: otp,
          password: password
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
            ? req.i18n.t('auth.passwordResetSuccess')
            : req.i18n.t('auth.passwordResetFailed')
        });
    }),
  });
};

export default publicRoute;