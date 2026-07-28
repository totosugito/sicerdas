import { db } from "../../../../../db/db-pool.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { ChapterItem } from "../../chapters.schema.ts";

export interface DetailChapterResult extends ServiceResponse {
  data?: ChapterItem;
}

export async function detailChapterService(id: string): Promise<DetailChapterResult> {
  const [chapter] = await db
    .select()
    .from(courseChapters)
    .where(eq(courseChapters.id, id))
    .limit(1);

  if (!chapter) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.chapters.notFound,
    };
  }

  return {
    success: true,
    data: {
      ...chapter,
      createdAt: chapter.createdAt.toISOString(),
      updatedAt: chapter.updatedAt.toISOString(),
    },
  };
}
