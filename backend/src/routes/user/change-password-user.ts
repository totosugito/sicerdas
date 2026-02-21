import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getAuthInstance } from '../../decorators/auth.decorator.ts';
import { db } from "../../db/db-pool.ts";
import { Type } from '@fastify/type-provider-typebox';
import { accounts } from "../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";

// Response schemas
const ChangePasswordResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

/**
 * Change user password
 * 
 * Expected JSON body input parameters:
 * - currentPassword: string - User's current password
 * - newPassword: string - User's new password
 * 
 * @param {string} currentPassword - Required. User's current password
 * @param {string} newPassword - Required. User's new password
 */
const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/change-password',
    method: 'PUT',
    schema: {
      tags: ['User'],
      summary: 'Change user password',
      description: 'Change the current user password. Expected JSON body fields: currentPassword, newPassword',
      consumes: ['application/json'],
      body: Type.Object({
        currentPassword: Type.String({
          description: 'Current password',
          minLength: 1
        }),
        newPassword: Type.String({
          description: 'New password',
          minLength: 6
        }),
      }),
      response: {
        200: ChangePasswordResponse,
        // Updated to use proper HTTP status codes with Fastify Sensible
        '4xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        }),
        '5xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        })
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const auth = getAuthInstance(app);
      const { currentPassword, newPassword } = req.body as {
        currentPassword: string,
        newPassword: string
      };

      // Validate input using Fastify Sensible badRequest
      if (!currentPassword) {
        return reply.badRequest(req.i18n.t('user.currentPasswordRequired'));
      }

      if (!newPassword) {
        return reply.badRequest(req.i18n.t('user.newPasswordRequired'));
      }

      if (currentPassword === newPassword) {
        return reply.badRequest(req.i18n.t('user.passwordsMustBeDifferent'));
      }

      // Get user ID from session (already verified by user.hook.ts)
      const userId = req.session.user.id;

      // Get user's current password hash
      const [userAccount] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId))
        .limit(1);

      if (!userAccount) {
        return reply.notFound(req.i18n.t('user.accountNotFound'));
      }

      const context = await auth.$context;

      if (!userAccount.password) {
        return reply.badRequest(req.i18n.t('user.accountHasNoPassword'));
      }

      // Verify current password
      const isPasswordValid = await context.password.verify({
        password: currentPassword,
        hash: userAccount.password
      },
      );

      if (!isPasswordValid) {
        return reply.forbidden(req.i18n.t('user.currentPasswordIncorrect'));
      }

      // Hash new password
      const hashedPassword = await context.password.hash(newPassword);

      // Update password in database
      await db
        .update(accounts)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(accounts.userId, userId));

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('user.passwordUpdatedSuccessfully'),
      });
    }),
  });
};

export default protectedRoute;