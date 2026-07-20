import { db } from "../../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../../db/schema/exam/package-sections.ts";
import { and, eq, asc, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { AdminSectionSimpleParams, AdminSimpleSectionItemT } from "../../package-sections.schema.ts";

export interface AdminListSectionSimpleResult extends ServiceResponse {
  data?: {
    items: AdminSimpleSectionItemT[];
    meta: PaginationMeta;
  };
}

export async function adminListSectionSimpleService(
  params: AdminSectionSimpleParams,
): Promise<AdminListSectionSimpleResult> {
  const { packageId, page = 1, limit = 1000 } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(examPackageSections.isActive, true)];
  if (packageId) {
    conditions.push(eq(examPackageSections.packageId, packageId));
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examPackageSections)
    .where(and(...conditions));

  const total = Number(countResult?.count || 0);

  const items = await db
    .select({
      value: examPackageSections.id,
      label: examPackageSections.title,
    })
    .from(examPackageSections)
    .where(and(...conditions))
    .orderBy(asc(examPackageSections.order))
    .limit(limit)
    .offset(offset);

  return {
    success: true,
    data: {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
}
