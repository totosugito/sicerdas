import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import {withErrorHandler} from "../../utils/withErrorHandler.ts";
import {db} from "../../db/index.ts";
import {users, verifications} from "../../db/schema/auth-schema.ts";
import {eq, and, gte, count} from "drizzle-orm";
import {PASSWORD_RESET_RATE_LIMIT, PASSWORD_RESET_RATE_LIMIT_WINDOW_MS} from "../../config/app-constant.ts";

// Response schemas
const ErrorResponse = Type.Object({
  success: Type.Boolean({ default: false }),
  message: Type.String(),
});

const SuccessResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/request-password-reset-email',
    method: 'POST',
    schema: {
      tags: ['Auth'],
      summary: 'Request password reset',
      description: 'Send password reset email to user',
      consumes: ['multipart/form-data'],
      response: {
        200: SuccessResponse,
        400: ErrorResponse,
        404: ErrorResponse,
        429: ErrorResponse, // Too Many Requests
        500: ErrorResponse
      }
    },
    handler: withErrorHandler(async (req, reply) => {
      // Parse form data into a key-value object
      const formData = new Map<string, string>();
      if (typeof req.parts === 'function') {
        for await (const part of req.parts()) {
          if (part.type === 'field') {
            formData.set(part.fieldname, part.value as string);
          }
        }
      }
      const { email, redirectTo } = Object.fromEntries(formData);

      // Validate required fields
      if (!email) {
        return reply.status(400).send({
          success: false,
          message: req.i18n.t('auth.emailRequired'),
        } as const);
      }

      // Check if email exists in users table and get user ID
      const existingUser = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email));
      
      if (existingUser.length === 0) {
        return reply.status(404).send({
          success: false,
          message: req.i18n.t('auth.userNotFound'),
        } as const);
      }

      const userId = existingUser[0].id;

      // Rate limiting: Check if user has made more than N requests in the last hour
      const ONE_HOUR_AGO = new Date(Date.now() - PASSWORD_RESET_RATE_LIMIT_WINDOW_MS);

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

      if (requestCount >= PASSWORD_RESET_RATE_LIMIT) {
        return reply.status(429).send({
          success: false,
          message: req.i18n.t('auth.passwordResetRateLimitExceeded'),
        } as const);
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