import { db } from "../../../db/db-pool.ts";
import { sessions } from "../../../db/schema/user/index.ts";
import { eq, and, ne } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/response.ts";

export interface SessionData {
  id: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  token: string;
}

export interface ListSessionsResponse extends ServiceResponse {
  data?: SessionData[];
}

export async function listSessionsService(userId: string): Promise<ListSessionsResponse> {
  const userSessions = await db
    .select({
      id: sessions.id,
      expiresAt: sessions.expiresAt,
      createdAt: sessions.createdAt,
      updatedAt: sessions.updatedAt,
      ipAddress: sessions.ipAddress,
      userAgent: sessions.userAgent,
      token: sessions.token,
    })
    .from(sessions)
    .where(eq(sessions.userId, userId));

  return {
    success: true,
    data: userSessions.map((session) => ({
      ...session,
      expiresAt: session.expiresAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    })),
  };
}

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
