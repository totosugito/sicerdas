import { db } from "../../../../../db/db-pool.ts";
import { courseLectureTexts } from "../../../../../db/schema/course/lecture-texts.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { ilike, sql, asc, eq, and, or } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { LectureTextSimpleQueryInput, SimpleLectureTextItem } from "../../lecture-texts.schema.ts";

export interface ListSimpleLectureTextResult extends ServiceResponse {
  data?: {
    items: SimpleLectureTextItem[];
    meta: PaginationMeta;
  };
}

export async function listSimpleLectureTextService(
  query: LectureTextSimpleQueryInput,
): Promise<ListSimpleLectureTextResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 1000;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (query.search) {
    const searchPattern = `%${query.search}%`;
    conditions.push(
      or(
        ilike(courseLectureTexts.title, searchPattern),
        ilike(educationCategories.name, searchPattern),
      ),
    );
  }

  if (query.categoryId) {
    conditions.push(eq(courseLectureTexts.categoryId, query.categoryId));
  }

  if (query.educationGradeId) {
    conditions.push(eq(courseLectureTexts.educationGradeId, query.educationGradeId));
  }

  if (query.status) {
    conditions.push(eq(courseLectureTexts.status, query.status as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courseLectureTexts)
    .leftJoin(educationCategories, eq(courseLectureTexts.categoryId, educationCategories.id))
    .where(whereClause);

  const total = Number(totalResult?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  const items = await db
    .select({
      value: courseLectureTexts.id,
      label: courseLectureTexts.title,
    })
    .from(courseLectureTexts)
    .leftJoin(educationCategories, eq(courseLectureTexts.categoryId, educationCategories.id))
    .where(whereClause)
    .orderBy(asc(courseLectureTexts.title))
    .limit(limit)
    .offset(offset);

  return {
    success: true,
    data: {
      items: items.map((item) => ({
        value: item.value,
        label: item.label || "Artikel Tanpa Nama",
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    },
  };
}
