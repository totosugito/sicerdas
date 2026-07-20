import { db } from "../../../../../db/db-pool.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { and, eq, asc, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { AdminPackageSimpleParams, AdminSimplePackageItemT } from "../../packages.schema.ts";

export interface AdminListPackageSimpleResult extends ServiceResponse {
  data?: {
    items: AdminSimplePackageItemT[];
    meta: PaginationMeta;
  };
}

export async function adminListPackageSimpleService(
  params: AdminPackageSimpleParams,
): Promise<AdminListPackageSimpleResult> {
  const { page = 1, limit = 1000 } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(examPackages.isActive, true)];

  // Count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examPackages)
    .where(and(...conditions));

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);

  // Fetch
  const items = await db
    .select({
      value: examPackages.id,
      label: examPackages.title,
    })
    .from(examPackages)
    .where(and(...conditions))
    .orderBy(asc(examPackages.title))
    .limit(limit)
    .offset(offset);

  return {
    success: true,
    data: {
      items,
      meta: { total, page, limit, totalPages },
    },
  };
}
