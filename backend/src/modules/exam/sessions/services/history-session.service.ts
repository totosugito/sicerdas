import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { eq, and, desc, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { HistoryBodyType, SessionHistoryItemT } from "../sessions.schema.ts";
import type { PaginationMeta } from "../../../../types/response.ts";

export interface HistorySessionResult extends ServiceResponse {
  data?: {
    items: SessionHistoryItemT[];
    meta: PaginationMeta;
  };
}

export async function historySessionService(
  userId: string,
  params: HistoryBodyType,
): Promise<HistorySessionResult> {
  const { packageId, sectionId, page = 1, limit = 5 } = params;
  const offset = (page - 1) * limit;

  const baseConditions = and(
    eq(examSessions.userId, userId),
    eq(examSessions.packageId, packageId),
    eq(examSessions.sectionId, sectionId),
  );

  // 1. Get Total Count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examSessions)
    .where(baseConditions);

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);

  // 2. Get Paginated Items
  const history = await db
    .select({
      id: examSessions.id,
      startTime: examSessions.startTime,
      endTime: examSessions.endTime,
      status: examSessions.status,
      mode: examSessions.mode,
      score: examSessions.score,
      totalCorrect: examSessions.totalCorrect,
      totalWrong: examSessions.totalWrong,
      totalSkipped: examSessions.totalSkipped,
      earnedPoints: examSessions.earnedPoints,
      maxPoints: examSessions.maxPoints,
    })
    .from(examSessions)
    .where(baseConditions)
    .orderBy(desc(examSessions.startTime))
    .limit(limit)
    .offset(offset);

  return {
    success: true,
    data: {
      items: history.map((h) => ({
        ...h,
        startTime: h.startTime.toISOString(),
        endTime: h.endTime?.toISOString() ?? null,
        score: h.score !== null ? Number(h.score) : null,
        earnedPoints: h.earnedPoints !== null ? Number(h.earnedPoints) : null,
        maxPoints: h.maxPoints !== null ? Number(h.maxPoints) : null,
      })),
      meta: { total, page, limit, totalPages },
    },
  };
}
