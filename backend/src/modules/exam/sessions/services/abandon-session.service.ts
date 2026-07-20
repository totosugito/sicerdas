import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { EnumExamSessionStatus } from "../../../../db/schema/exam/enums.ts";
import { eq, and } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { AbandonSessionData } from "../sessions.schema.ts";

export interface AbandonSessionResult extends ServiceResponse {
  data?: AbandonSessionData;
}

export async function abandonSessionService(
  userId: string,
  sessionId: string,
): Promise<AbandonSessionResult> {
  const [session] = await db
    .update(examSessions)
    .set({ status: EnumExamSessionStatus.ABANDONED, updatedAt: new Date() })
    .where(
      and(
        eq(examSessions.id, sessionId),
        eq(examSessions.userId, userId),
        eq(examSessions.status, EnumExamSessionStatus.IN_PROGRESS),
      ),
    )
    .returning({ id: examSessions.id });

  if (!session) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.sessions.abandon.notFound };
  }

  return {
    success: true,
    data: { id: session.id },
  };
}
