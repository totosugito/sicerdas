import { db } from "../../../../../db/db-pool.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminCreateChapterInput, ChapterItem } from "../../chapters.schema.ts";
import { recalculateCourseChapterStats } from "../../../../../utils/course/course-stats-utils.ts";

export interface CreateChapterResult extends ServiceResponse {
  data?: ChapterItem;
}

export async function createChapterService(
  input: AdminCreateChapterInput,
  createdByUserId: string,
): Promise<CreateChapterResult> {
  // 1. Check if course exists
  const [existingCourse] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.id, input.courseId))
    .limit(1);

  if (!existingCourse) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.courses.notFound,
    };
  }

  // 2. Determine position if not provided
  let position = input.position;
  if (!position) {
    const [maxResult] = await db
      .select({ maxPos: sql<string>`COALESCE(MAX(position), 0)` })
      .from(courseChapters)
      .where(eq(courseChapters.courseId, input.courseId));

    const nextVal = Number(maxResult?.maxPos ?? 0) + 1;
    position = String(nextVal);
  }

  // 3. Insert new chapter
  const [newChapter] = await db
    .insert(courseChapters)
    .values({
      courseId: input.courseId,
      chapterName: input.chapterName,
      createdByUserId,
      position,
      isActive: input.isActive ?? true,
    })
    .returning();

  // 4. Recalculate course chapter stats asynchronously
  recalculateCourseChapterStats(input.courseId).catch((err) =>
    console.error({ err, courseId: input.courseId }, "[CreateChapter] Stats recalculation failed"),
  );

  return {
    success: true,
    data: {
      ...newChapter,
      createdAt: newChapter.createdAt.toISOString(),
      updatedAt: newChapter.updatedAt.toISOString(),
    },
  };
}
