import { db } from "../../../db/db-pool.ts";
import { appVersion } from "../../../db/schema/app/app-version.ts";
import { and, eq, asc, sql, ilike } from "drizzle-orm";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import type { PaginationMeta } from "../../../types/response.ts";

export interface ListVersionSimpleParams {
  dataType: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VersionSimpleItem {
  id: number;
  name: string;
  published: boolean;
}

export interface ListVersionSimpleResponseData {
  items: VersionSimpleItem[];
  meta: PaginationMeta;
}

export async function listVersionSimpleService(params: ListVersionSimpleParams): Promise<ListVersionSimpleResponseData> {
  const { dataType, search, page = 1, limit = 1000 } = params;
  const offset = (page - 1) * limit;

  const conditions = [
    eq(appVersion.dataType, dataType as any),
  ];

  if (search && search.trim() !== "") {
    conditions.push(ilike(appVersion.name, `%${search.trim()}%`));
  }

  // Count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(appVersion)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  // Fetch
  const items = await db
    .select({
      id: appVersion.id,
      name: appVersion.name,
      status: appVersion.status,
    })
    .from(appVersion)
    .where(and(...conditions))
    .orderBy(asc(appVersion.name))
    .limit(limit)
    .offset(offset);

  return {
    items: items.map((item) => ({
      id: item.id,
      name: item.name || "",
      published: item.status === EnumContentStatus.PUBLISHED,
    })),
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}
