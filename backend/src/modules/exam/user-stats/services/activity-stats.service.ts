import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/index.ts";
import { eq, and, gte, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { ActivityData } from "../user-stats.schema.ts";

export interface ActivityStatsResult extends ServiceResponse {
  data?: ActivityData[];
}

export async function activityStatsService(
  userId: string,
  days: number,
): Promise<ActivityStatsResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await db
    .select({
      date: sql<string>`TO_CHAR(${examSessions.startTime}, 'YYYY-MM-DD')`,
      totalCorrect: sql<number>`SUM(${examSessions.totalCorrect})::int`,
      totalWrong: sql<number>`SUM(${examSessions.totalWrong})::int`,
      totalSkipped: sql<number>`SUM(${examSessions.totalSkipped})::int`,
      totalSessions: sql<number>`COUNT(${examSessions.id})::int`,
    })
    .from(examSessions)
    .where(and(eq(examSessions.userId, userId), gte(examSessions.startTime, startDate)))
    .groupBy(sql`TO_CHAR(${examSessions.startTime}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${examSessions.startTime}, 'YYYY-MM-DD')`);

  return {
    success: true,
    data: stats.map((row: any) => ({
      date: row.date,
      totalQuestions: row.totalCorrect + row.totalWrong + row.totalSkipped,
      totalCorrect: row.totalCorrect,
      totalWrong: row.totalWrong,
      totalSessions: row.totalSessions,
    })),
  };
}
