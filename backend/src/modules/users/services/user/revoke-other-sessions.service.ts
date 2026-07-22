import { db } from "../../../../db/db-pool.ts";
import { sessions } from "../../../../db/schema/user/index.ts";
import { eq, and, ne } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/response.ts";

export interface RevokeOtherSessionsParams {
  userId: string;
  token: string;
}

export interface RevokeOtherSessionsResponse extends ServiceResponse {
  deletedCount?: number;
}

export async function revokeOtherSessionsService(
  params: RevokeOtherSessionsParams,
): Promise<RevokeOtherSessionsResponse> {
  const { userId, token } = params;

  // Verify that the token belongs to the user
  const tokenSession = await db
    .select({
      userId: sessions.userId,
    })
    .from(sessions)
    .where(eq(sessions.token, token));

  if (!tokenSession.length || tokenSession[0].userId !== userId) {
    return {
      success: false,
      statusCode: 403,
      errorKey: ($) => $.auth.forbidden,
    };
  }

  // Delete all sessions for the user except the provided token
  const deletedSessions = await db
    .delete(sessions)
    .where(and(eq(sessions.userId, userId), ne(sessions.token, token)))
    .returning({ id: sessions.id });

  return {
    success: true,
    deletedCount: deletedSessions.length,
  };
}
