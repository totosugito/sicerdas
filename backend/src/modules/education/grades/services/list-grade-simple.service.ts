import { db } from "../../../../db/db-pool.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { asc, sql, eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { PaginationMeta } from "../../../../types/response.ts";
import type { GradeSimpleData } from "../education.schema.ts";

export interface ListGradeSimpleResult extends ServiceResponse {
  data?: { items: GradeSimpleData[]; meta: PaginationMeta };
}

export async function listGradeSimpleService(
  page: number,
  limit: number,
  isDefault: boolean,
): Promise<ListGradeSimpleResult> {
  const offset = (page - 1) * limit;
  const whereClause = isDefault !== undefined ? eq(educationGrades.isDefault, isDefault) : undefined;

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(educationGrades).where(whereClause as any);
  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const items = await db
    .select({
      value: sql<string>`${educationGrades.id}::text`,
      label: educationGrades.name,
    })
    .from(educationGrades)
    .where(whereClause as any)
    .orderBy(asc(educationGrades.name))
    .limit(limit)
    .offset(offset);

  return { success: true, data: { items, meta: { total, page, limit, totalPages } } };
}
