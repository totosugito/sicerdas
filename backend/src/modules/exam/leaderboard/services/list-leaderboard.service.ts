import { db } from "../../../../db/db-pool.ts";
import { examUserStatsGlobal } from "../../../../db/schema/exam/user-stats-global.ts";
import { users } from "../../../../db/schema/users/users.ts";
import { eq, desc } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { LeaderboardData, LeaderboardParams } from "../leaderboard.schema.ts";

export interface ListLeaderboardResult extends ServiceResponse {
  data?: LeaderboardData[];
}

export async function listLeaderboardService(
  params: LeaderboardParams,
): Promise<ListLeaderboardResult> {
  const { limit = 50 } = params;

  const ranking = await db
    .select({
      userId: examUserStatsGlobal.userId,
      name: users.name,
      averageScore: examUserStatsGlobal.averageScore,
      totalExamsTaken: examUserStatsGlobal.totalExamsTaken,
    })
    .from(examUserStatsGlobal)
    .innerJoin(users, eq(examUserStatsGlobal.userId, users.id))
    .orderBy(desc(examUserStatsGlobal.averageScore))
    .limit(limit);

  return {
    success: true,
    data: ranking.map((r, index) => ({
      ...r,
      rank: index + 1,
    })),
  };
}
