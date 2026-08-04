import { db } from "../../../../db/db-pool.ts";
import { examUserStatsTag } from "../../../../db/schema/exam/user-stats-tag.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { eq, desc, asc, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { PaginationMeta } from "../../../../types/response.ts";
import type { TagStatsParams, TagStatsData } from "../user-stats.schema.ts";

export interface TagStatsResult extends ServiceResponse {
  data?: { items: TagStatsData[]; meta: PaginationMeta };
}

export async function tagStatsService(
  userId: string,
  params: TagStatsParams = {},
): Promise<TagStatsResult> {
  const { page = 1, limit = 5, sortBy = "accuracyRate", order = "desc" } = params;
  const offset = (page - 1) * limit;
  const baseConditions = eq(examUserStatsTag.userId, userId);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examUserStatsTag)
    .where(baseConditions);

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);

  let sortColumn: any = examUserStatsTag.accuracyRate;
  if (sortBy === "tagName") sortColumn = educationTags.name;
  else if (sortBy === "totalQuestionsAnswered") sortColumn = examUserStatsTag.totalQuestionsAnswered;
  else if (sortBy === "updatedAt") sortColumn = examUserStatsTag.updatedAt;

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
