import { db } from "../../../../db/db-pool.ts";
import { sessions } from "../../../../db/schema/users/index.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/response.ts";

export interface RevokeSessionParams {
  userId: string;
  sessionToken: string;
}

export async function revokeSessionService(params: RevokeSessionParams): Promise<ServiceResponse> {
  const { userId, sessionToken } = params;

  if (!sessionToken) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.user.sessions.tokenRequired,
    };
  }

  // Check if session exists and belongs to the user
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, sessionToken))
    .limit(1);

  if (session.length === 0) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.user.sessions.sessionNotFound,
    };
  }

  if (session[0].userId !== userId) {
    return {
      success: false,
      statusCode: 403,
      errorKey: ($) => $.user.sessions.accessDenied,
    };
  }

  // Delete the session
  await db.delete(sessions).where(eq(sessions.token, sessionToken));

  return { success: true };
}
