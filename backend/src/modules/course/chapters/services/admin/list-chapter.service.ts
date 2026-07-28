import { db } from "../../../../../db/db-pool.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { eq, asc } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { ChapterItem } from "../../chapters.schema.ts";

export interface ListChapterResult extends ServiceResponse {
  data?: ChapterItem[];
}

export async function listChapterService(courseId: string): Promise<ListChapterResult> {
  const chapters = await db
    .select()
    .from(courseChapters)
    .where(eq(courseChapters.courseId, courseId))
    .orderBy(asc(courseChapters.position));

  const data: ChapterItem[] = chapters.map((chapter) => ({
    ...chapter,
    createdAt: chapter.createdAt.toISOString(),
    updatedAt: chapter.updatedAt.toISOString(),
  }));

  return {
    success: true,
    data,
  };
}
