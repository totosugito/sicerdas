import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { eq, desc, sql, and } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { AllHistoryBodyType, AllSessionHistoryItemT } from "../sessions.schema.ts";
import type { PaginationMeta } from "../../../../types/response.ts";

export interface AllSessionsResult extends ServiceResponse {
  data?: {
    items: AllSessionHistoryItemT[];
    meta: PaginationMeta;
  };
}

export async function allSessionsService(
  userId: string,
  params: AllHistoryBodyType,
): Promise<AllSessionsResult> {
  const { page = 1, limit = 10, status } = params;
  const offset = (page - 1) * limit;

  const baseConditions = and(
    eq(examSessions.userId, userId),
    status ? eq(examSessions.status, status) : undefined,
  );

  // 1. Get Total Count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examSessions)
    .where(baseConditions);

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);

  // 2. Get Paginated Items with Package and Section titles
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
      packageTitle: examPackages.title,
      sectionTitle: examPackageSections.title,
      packageId: examSessions.packageId,
      earnedPoints: examSessions.earnedPoints,
      maxPoints: examSessions.maxPoints,
    })
    .from(examSessions)
    .innerJoin(examPackages, eq(examSessions.packageId, examPackages.id))
    .innerJoin(examPackageSections, eq(examSessions.sectionId, examPackageSections.id))
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
