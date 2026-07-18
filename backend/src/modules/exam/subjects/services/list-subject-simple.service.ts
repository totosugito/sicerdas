import { db } from "../../../../db/db-pool.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { and, eq, asc, sql, ilike } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { SubjectSimpleData } from "../education.schema.ts";

export interface ListSubjectSimpleResult extends ServiceResponse {
  data?: { items: SubjectSimpleData[]; meta: { total: number; page: number; limit: number; totalPages: number } };
}

export async function listSubjectSimpleService(
  search: string | undefined,
  page: number,
  limit: number,
): Promise<ListSubjectSimpleResult> {
  const offset = (page - 1) * limit;
  const conditions = [eq(examSubjects.isActive, true)];

  if (search && search.trim() !== "") {
    conditions.push(ilike(examSubjects.name, `%${search.trim().toLowerCase()}%`));
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examSubjects)
    .where(and(...conditions));

  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const items = await db
    .select({ value: examSubjects.id, label: examSubjects.name })
    .from(examSubjects)
    .where(and(...conditions))
    .orderBy(asc(examSubjects.name))
    .limit(limit)
    .offset(offset);

  return { success: true, data: { items, meta: { total, page, limit, totalPages } } };
}
