import { db } from "../../../../db/db-pool.ts";
import { sessions } from "../../../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/response.ts";
import type { SessionData } from "../../user.schema.ts";

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
