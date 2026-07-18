import { db } from "../../../db/db-pool.ts";
import { bookInteractions } from "../../../db/schema/book/index.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";

export interface UserStatsResult extends ServiceResponse {
  data?: { totalFavorites: number; totalMaterialsRead: number; totalDownloads: number };
}

export async function userStatsService(userId: string): Promise<UserStatsResult> {
  const [stats] = await db
    .select({
      totalFavorites: sql<number>`count(*) filter (where ${bookInteractions.bookmarked} = true)::int`,
      totalMaterialsRead: sql<number>`count(*) filter (where ${bookInteractions.viewCount} > 0)::int`,
      totalDownloads: sql<number>`coalesce(sum(${bookInteractions.downloadCount}), 0)::int`,
    })
    .from(bookInteractions)
    .where(eq(bookInteractions.userId, userId));

  return {
    success: true,
    data: {
      totalFavorites: stats?.totalFavorites ?? 0,
      totalMaterialsRead: stats?.totalMaterialsRead ?? 0,
      totalDownloads: stats?.totalDownloads ?? 0,
    },
  };
}
