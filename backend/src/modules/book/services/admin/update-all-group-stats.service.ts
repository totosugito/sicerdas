import { db } from "../../../../db/db-pool.ts";
import { bookGroup, bookGroupStats, books } from "../../../../db/schema/book/index.ts";
import { eq, and, count } from "drizzle-orm";
import { EnumContentStatus } from "../../../../db/schema/enum/enum-app.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { GroupStatsData } from "../../book.schema.ts";

export interface UpdateAllGroupStatsResult extends ServiceResponse {
  data?: GroupStatsData[];
}

export async function updateAllGroupStatsService(): Promise<UpdateAllGroupStatsResult> {
  const allGroups = await db
    .select({ id: bookGroup.id })
    .from(bookGroup)
    .innerJoin(books, eq(bookGroup.id, books.bookGroupId))
    .where(eq(books.status, EnumContentStatus.PUBLISHED))
    .groupBy(bookGroup.id);

  const results: GroupStatsData[] = [];

  for (const group of allGroups) {
    const bookCountResult = await db
      .select({ count: count() })
      .from(books)
      .where(and(eq(books.bookGroupId, group.id), eq(books.status, EnumContentStatus.PUBLISHED)));

    const bookTotal = Number(bookCountResult[0].count);
    const existingStats = await db.select().from(bookGroupStats).where(eq(bookGroupStats.bookGroupId, group.id)).limit(1);

    let updatedStats;
    if (existingStats.length > 0) {
      updatedStats = await db
        .update(bookGroupStats)
        .set({ bookTotal, updatedAt: new Date() })
        .where(eq(bookGroupStats.bookGroupId, group.id))
        .returning();
    } else {
      updatedStats = await db.insert(bookGroupStats).values({ bookGroupId: group.id, bookTotal }).returning();
    }

    results.push({
      groupId: updatedStats[0].bookGroupId,
      bookTotal: updatedStats[0].bookTotal ?? 0,
      updatedAt: updatedStats[0].updatedAt?.toISOString() || new Date().toISOString(),
    });
  }

  return { success: true, data: results };
}
