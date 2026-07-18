import { db } from "../../../db/db-pool.ts";
import { bookGroup, bookGroupStats, books } from "../../../db/schema/book/index.ts";
import { eq, count, and } from "drizzle-orm";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { GroupStatsData } from "../book.schema.ts";

export interface UpdateGroupStatsResult extends ServiceResponse {
  data?: GroupStatsData;
}

export async function updateGroupStatsService(groupId: number): Promise<UpdateGroupStatsResult> {
  const existingGroup = await db.select().from(bookGroup).where(eq(bookGroup.id, groupId)).limit(1);
  if (existingGroup.length === 0) {
    return { success: false, statusCode: 404, errorKey: ($) => $.book.groupStats.notFound };
  }

  const bookCountResult = await db
    .select({ count: count() })
    .from(books)
    .where(and(eq(books.bookGroupId, groupId), eq(books.status, EnumContentStatus.PUBLISHED)));

  const bookTotal = Number(bookCountResult[0].count);
  const existingStats = await db.select().from(bookGroupStats).where(eq(bookGroupStats.bookGroupId, groupId)).limit(1);

  let updatedStats;
  if (existingStats.length > 0) {
    updatedStats = await db
      .update(bookGroupStats)
      .set({ bookTotal, updatedAt: new Date() })
      .where(eq(bookGroupStats.bookGroupId, groupId))
      .returning();
  } else {
    updatedStats = await db.insert(bookGroupStats).values({ bookGroupId: groupId, bookTotal }).returning();
  }

  return {
    success: true,
    data: {
      groupId: updatedStats[0].bookGroupId,
      bookTotal: updatedStats[0].bookTotal ?? 0,
      updatedAt: updatedStats[0].updatedAt?.toISOString() || new Date().toISOString(),
    },
  };
}
