import { db } from "../../../../db/db-pool.ts";
import { examUserStatsSubject } from "../../../../db/schema/exam/user-stats-subject.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { eq, desc, asc, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { PaginationMeta } from "../../../../types/response.ts";
import type { SubjectStatsParams, SubjectStatsData } from "../user-stats.schema.ts";

export interface SubjectStatsResult extends ServiceResponse {
  data?: { items: SubjectStatsData[]; meta: PaginationMeta };
}

export async function subjectStatsService(
  userId: string,
  params: SubjectStatsParams,
): Promise<SubjectStatsResult> {
  const { page = 1, limit = 10, sortBy = "accuracyRate", order = "desc" } = params;
  const offset = (page - 1) * limit;
  const baseConditions = eq(examUserStatsSubject.userId, userId);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examUserStatsSubject)
    .where(baseConditions);

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);

  let sortColumn: any = examUserStatsSubject.accuracyRate;
  if (sortBy === "subjectName") sortColumn = examSubjects.name;
  else if (sortBy === "totalQuestionsAnswered") sortColumn = examUserStatsSubject.totalQuestionsAnswered;
  else if (sortBy === "updatedAt") sortColumn = examUserStatsSubject.updatedAt;

  const stats = await db
    .select({
      id: examUserStatsSubject.id,
      subjectId: examUserStatsSubject.subjectId,
      subjectName: examSubjects.name,
      totalQuestionsAnswered: examUserStatsSubject.totalQuestionsAnswered,
      totalCorrect: examUserStatsSubject.totalCorrect,
      totalWrong: examUserStatsSubject.totalWrong,
      accuracyRate: examUserStatsSubject.accuracyRate,
      updatedAt: examUserStatsSubject.updatedAt,
    })
    .from(examUserStatsSubject)
    .innerJoin(examSubjects, eq(examUserStatsSubject.subjectId, examSubjects.id))
    .where(baseConditions)
    .orderBy(order === "desc" ? desc(sortColumn) : asc(sortColumn))
    .limit(limit)
    .offset(offset);

  return {
    success: true,
    data: {
      items: stats.map((s) => ({ ...s, updatedAt: s.updatedAt.toISOString() })),
      meta: { total, page, limit, totalPages },
    },
  };
}
