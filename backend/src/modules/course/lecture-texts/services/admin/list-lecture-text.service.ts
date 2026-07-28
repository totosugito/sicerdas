import { db } from "../../../../../db/db-pool.ts";
import { courseLectureTexts } from "../../../../../db/schema/course/lecture-texts.ts";
import { ilike, sql, desc } from "drizzle-orm";
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

  const whereClause = query.search
    ? ilike(courseLectureTexts.title, `%${query.search}%`)
    : undefined;

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(courseLectureTexts)
    .where(whereClause);

  const total = Number(totalResult?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  const items = await db
    .select()
    .from(courseLectureTexts)
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
