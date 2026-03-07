import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { eq, and, ne } from "drizzle-orm";
import { sessions } from "../../db/schema/user/index.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";

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
      const { t } = getTypedI18n(req);
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
          message: t($ => $.auth.forbidden)
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
        message: t($ => $.auth.sessions_revoked, { count: deletedSessions.length })
      });
    }),
  });
};

export default protectedRoute;