import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { eq, and, ne } from "drizzle-orm";
import { sessions } from "../../db/schema/index.ts";

// Request schema
const RevokeOtherSessionsRequest = Type.Object({
  token: Type.String()
});

// Response schema
const RevokeOtherSessionsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String()
});

/**
 * Revoke other user sessions
 * 
 * Revokes all sessions for the authenticated user except the provided token
 */
const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/revoke-other-sessions-v1',
    method: 'POST',
    schema: {
      tags: ['User'],
      summary: 'Revoke other user sessions',
      description: 'Revokes all sessions for the authenticated user except the provided token',
      body: RevokeOtherSessionsRequest,
      response: {
        200: RevokeOtherSessionsResponse,
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
      // Get the session token from the request body
      const { token } = req.body as { token: string };

      // Get user ID from session (already verified by user.hook.ts)
      const userId = req.session.user.id;

      // First, verify that the token belongs to the user
      const tokenSession = await db
        .select({
          userId: sessions.userId
        })
        .from(sessions)
        .where(eq(sessions.token, token));

      if (!tokenSession.length || tokenSession[0].userId !== userId) {
        return reply.status(403).send({
          success: false,
          message: req.i18n.t('auth.forbidden')
        });
      }

      // Delete all sessions for the user except the provided token
      const deletedSessions = await db
        .delete(sessions)
        .where(and(
          eq(sessions.userId, userId),
          ne(sessions.token, token)
        ))
        .returning({ id: sessions.id });

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('auth.sessions_revoked', { count: deletedSessions.length })
      });
    }),
  });
};

export default protectedRoute;