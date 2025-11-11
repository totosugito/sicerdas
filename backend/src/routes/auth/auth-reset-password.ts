import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import {withErrorHandler} from "../../utils/withErrorHandler.ts";

/**
 * Reset password
 * 
 * Expected JSON body input parameters:
 * - token: string - Password reset token
 * - newPassword: string - New password for the user
 * 
 * @param {string} token - Required. Password reset token
 * @param {string} newPassword - Required. New password for the user
 */
const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/auth-reset-password',
    method: 'POST',
    schema: {
      tags: ['Auth'],
      summary: 'Reset password',
      description: 'Reset user password using token and new password. Expected JSON body fields: token, newPassword',
      consumes: ['application/json'],
      body: Type.Object({
        token: Type.String(),
        newPassword: Type.String()
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
      const { token, newPassword } = req.body as { token: string; newPassword: string };

      // Validate required fields using Fastify Sensible badRequest
      if (!token || !newPassword) {
        return reply.badRequest(req.i18n.t('auth.tokenAndPasswordRequired'));
      }

      // Use Fastify's built-in inject method to call the better-auth API
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/reset-password',
        payload: JSON.stringify({
          token: token,
          newPassword: newPassword
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