import { db } from "../../../../../db/db-pool.ts";
import { courseLectureTexts } from "../../../../../db/schema/course/lecture-texts.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { ilike, sql, desc, eq, and, or } from "drizzle-orm";
import { resolveBlockNoteUrls } from "../../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { LectureTextListQueryInput, LectureTextItem } from "../../lecture-texts.schema.ts";

export interface ListLectureTextResult extends ServiceResponse {
  data?: {
    items: LectureTextItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export async function listLectureTextService(
  query: LectureTextListQueryInput,
): Promise<ListLectureTextResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
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
      id: courseLectureTexts.id,
      title: courseLectureTexts.title,
      content: courseLectureTexts.content,
      categoryId: courseLectureTexts.categoryId,
      educationGradeId: courseLectureTexts.educationGradeId,
      status: courseLectureTexts.status,
      createdByUserId: courseLectureTexts.createdByUserId,
      createdAt: courseLectureTexts.createdAt,
      updatedAt: courseLectureTexts.updatedAt,
    })
    .from(courseLectureTexts)
    .leftJoin(educationCategories, eq(courseLectureTexts.categoryId, educationCategories.id))
    .where(whereClause)
    .orderBy(desc(courseLectureTexts.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    success: true,
    data: {
      items: items.map((item) => ({
        ...item,
        content: resolveBlockNoteUrls(item.content),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
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
