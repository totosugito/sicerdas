import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { and, eq, asc, sql, ilike } from "drizzle-orm";
import type { ServiceResponse, PaginationMeta } from "../../../../types/index.ts";
import type { PassageSimpleListParams } from "../passages.schema.ts";

export interface ListPassagesSimpleItem {
  value: string;
  label: string;
}

export interface ListPassagesSimpleResult extends ServiceResponse {
  data?: {
    items: ListPassagesSimpleItem[];
    meta: PaginationMeta;
  };
}

export async function listPassagesSimpleService(
  body: PassageSimpleListParams,
): Promise<ListPassagesSimpleResult> {
  const { subjectId, search, page = 1, limit = 1000 } = body;
  const offset = (page - 1) * limit;

  const conditions = [eq(examPassages.isActive, true)];
  if (subjectId) {
    conditions.push(eq(examPassages.subjectId, subjectId));
  }
  if (search && search.trim() !== "") {
    conditions.push(ilike(examPassages.title, `%${search.trim()}%`));
  }

  // Count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(examPassages)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  // Fetch
  const items = await db
    .select({
      value: examPassages.id,
      label: sql<string>`COALESCE(${examPassages.title}, 'No Title')`,
    })
    .from(examPassages)
    .where(and(...conditions))
    .orderBy(asc(examPassages.title))
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
        totalPages,
      },
    },
  };
}
