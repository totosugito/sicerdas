import { db } from "../../../db/db-pool.ts";
import { bookCategory, bookGroup, bookGroupStats } from "../../../db/schema/book/index.ts";
import { eq, and, gt, isNotNull, or, isNull } from "drizzle-orm";
import type { ServiceResponse } from "../../../types/index.ts";
import type { FilterParamsData } from "../book.schema.ts";

export interface FilterParamsResult extends ServiceResponse {
  data?: FilterParamsData[];
}

export async function filterParamsService(): Promise<FilterParamsResult> {
  const result = await db
    .select({
      categoryId: bookCategory.id,
      categoryCode: bookCategory.code,
      categoryName: bookCategory.name,
      categoryDesc: bookCategory.desc,
      categoryStatus: bookCategory.status,
      groupId: bookGroup.id,
      groupName: bookGroup.name,
      groupShortName: bookGroup.shortName,
      groupDesc: bookGroup.desc,
      groupStatus: bookGroup.status,
      bookTotal: bookGroupStats.bookTotal,
    })
    .from(bookCategory)
    .leftJoin(bookGroup, eq(bookGroup.categoryId, bookCategory.id))
    .leftJoin(bookGroupStats, eq(bookGroupStats.bookGroupId, bookGroup.id))
    .where(
      or(
        and(isNotNull(bookGroupStats.bookTotal), gt(bookGroupStats.bookTotal, 0)),
        isNull(bookGroup.id),
      ),
    )
    .orderBy(bookCategory.id, bookGroup.id);

  const categoriesMap = new Map<number, FilterParamsData>();

  for (const row of result) {
    if (!categoriesMap.has(row.categoryId)) {
      categoriesMap.set(row.categoryId, {
        id: row.categoryId,
        code: row.categoryCode || "",
        name: row.categoryName || "",
        desc: row.categoryDesc || undefined,
        status: row.categoryStatus || "",
        groups: [],
      });
    }

    const category = categoriesMap.get(row.categoryId)!;

    if (row.groupId !== null) {
      category.groups.push({
        id: row.groupId,
        name: row.groupName || "",
        shortName: row.groupShortName || "",
        desc: row.groupDesc || undefined,
        status: row.groupStatus || "",
        stats: { bookTotal: row.bookTotal || 0 },
      });
    }
  }

  return {
    success: true,
    data: Array.from(categoriesMap.values()).filter((c) => c.groups.length > 0),
  };
}
