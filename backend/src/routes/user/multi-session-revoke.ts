import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { eq } from "drizzle-orm";
import { sessions } from "../../db/schema/index.ts";

// Request schema
const RevokeSessionRequest = Type.Object({
  sessionToken: Type.String({ description: 'The token of the session to revoke' })
});

// Response schemas
const RevokeSessionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String()
});

/**
 * Revoke a user session
 * 
 * Revokes a specific session by its token for the authenticated user.
 */
const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/multi-session-revoke',
    method: 'POST',
    schema: {
      tags: ['User'],
      summary: 'Revoke a user session',
      description: 'Revokes a specific session by its token for the authenticated user',
      body: RevokeSessionRequest,
      response: {
        200: RevokeSessionResponse,
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
      // Get user ID from session (already verified by user.hook.ts)
      const userId = req.session.user.id;

      // Get the session token from the request body
      const { sessionToken } = req.body as { sessionToken: string };

      // Validate that sessionToken is provided
      if (!sessionToken) {
        return reply.badRequest(req.i18n.t('user.sessions.tokenRequired'));
      }

      // Check if the session exists and belongs to the user
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, sessionToken))
        .limit(1);

      if (session.length === 0) {
        return reply.notFound(req.i18n.t('user.sessions.sessionNotFound'));
      }

      // Verify that the session belongs to the current user
      if (session[0].userId !== userId) {
        return reply.forbidden(req.i18n.t('user.sessions.accessDenied'));
      }

      // Delete the session
      await db
        .delete(sessions)
        .where(eq(sessions.token, sessionToken));

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('user.sessions.sessionRevoked')
      });
    }),
  });
};

export default protectedRoute;