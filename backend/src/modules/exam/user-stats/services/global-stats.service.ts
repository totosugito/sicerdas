import { db } from "../../../../db/db-pool.ts";
import { examUserStatsGlobal } from "../../../../db/schema/exam/user-stats-global.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { GlobalStatsData } from "../user-stats.schema.ts";

export interface GlobalStatsResult extends ServiceResponse {
  data?: GlobalStatsData | null;
}

export async function globalStatsService(userId: string): Promise<GlobalStatsResult> {
  const [stats] = await db
    .select()
    .from(examUserStatsGlobal)
    .where(eq(examUserStatsGlobal.userId, userId))
    .limit(1);

  if (!stats) {
    return { success: true, data: null };
  }

  const accuracyRate =
    stats.totalQuestionsAnswered > 0
      ? ((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100).toFixed(2)
      : "0";

  return {
    success: true,
    data: {
      ...stats,
      accuracyRate,
      lastActiveAt: stats.lastActiveAt?.toISOString() || null,
      updatedAt: stats.updatedAt.toISOString(),
    },
  };
}
