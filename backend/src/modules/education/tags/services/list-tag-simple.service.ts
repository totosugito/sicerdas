import { db } from "../../../../db/db-pool.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { asc, sql, eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { TagSimpleData } from "../education.schema.ts";

export interface ListTagSimpleResult extends ServiceResponse {
  data?: { items: TagSimpleData[]; meta: { total: number; page: number; limit: number; totalPages: number } };
}

export async function listTagSimpleService(
  page: number,
  limit: number,
): Promise<ListTagSimpleResult> {
  const offset = (page - 1) * limit;

  const baseQuery = db.select().from(educationTags).where(eq(educationTags.isActive, true));

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(baseQuery.as("subquery"));

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const items = await db
    .select({
      value: sql<string>`${educationTags.id}::text`,
      label: educationTags.name,
    })
    .from(educationTags)
    .where(eq(educationTags.isActive, true))
    .orderBy(asc(educationTags.name))
    .limit(limit)
    .offset(offset);

  return { success: true, data: { items, meta: { total, page, limit, totalPages } } };
}
