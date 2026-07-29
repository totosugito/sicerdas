import { db } from "../../../../../db/db-pool.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { eq, inArray, asc } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";

export interface StructureCourseResult extends ServiceResponse {
  data?: any[];
}

export async function structureCourseService(courseId: string): Promise<StructureCourseResult> {
  // 1. Fetch chapters
  const chapters = await db
    .select()
    .from(courseChapters)
    .where(eq(courseChapters.courseId, courseId))
    .orderBy(asc(courseChapters.position));

  if (chapters.length === 0) {
    return { success: true, data: [] };
  }

  const chapterIds = chapters.map((c) => c.id);

  // 2. Fetch lectures for these chapters
  const lectures = await db
    .select()
    .from(courseLectures)
    .where(inArray(courseLectures.chapterId, chapterIds))
    .orderBy(asc(courseLectures.position));

  // 3. Build structure mapping
  const structuredChapters = chapters.map((chapter) => {
    const chapterLectures = lectures
      .filter((l) => l.chapterId === chapter.id)
      .map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      }));

    return {
      ...chapter,
      createdAt: chapter.createdAt.toISOString(),
      updatedAt: chapter.updatedAt.toISOString(),
      lectures: chapterLectures,
    };
  });

  return {
    success: true,
    data: structuredChapters,
  };
}
