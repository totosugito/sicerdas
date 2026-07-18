import { db } from "../../../../db/db-pool.ts";
import { examUserStatsTag } from "../../../../db/schema/exam/user-stats-tag.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { eq, desc } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { TagStatsData } from "../user-stats.schema.ts";

export interface TagStatsResult extends ServiceResponse {
  data?: TagStatsData[];
}

export async function tagStatsService(userId: string): Promise<TagStatsResult> {
  const stats = await db
    .select({
      id: examUserStatsTag.id,
      tagId: examUserStatsTag.tagId,
      tagName: educationTags.name,
      totalQuestionsAnswered: examUserStatsTag.totalQuestionsAnswered,
      totalCorrect: examUserStatsTag.totalCorrect,
      totalWrong: examUserStatsTag.totalWrong,
      accuracyRate: examUserStatsTag.accuracyRate,
      updatedAt: examUserStatsTag.updatedAt,
    })
    .from(examUserStatsTag)
    .innerJoin(educationTags, eq(examUserStatsTag.tagId, educationTags.id))
    .where(eq(examUserStatsTag.userId, userId))
    .orderBy(desc(examUserStatsTag.accuracyRate));

  return {
    success: true,
    data: stats.map((s) => ({ ...s, updatedAt: s.updatedAt.toISOString() })),
  };
}
