import { db } from "../../../../../db/db-pool.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminCreateLectureInput, LectureItem } from "../../lectures.schema.ts";
import { recalculateChapterLectureStats } from "../../../../../utils/course/course-stats-utils.ts";

export interface CreateLectureResult extends ServiceResponse {
  data?: LectureItem;
}

export async function createLectureService(
  input: AdminCreateLectureInput,
  createdByUserId: string,
): Promise<CreateLectureResult> {
  // 1. Check if chapter exists
  const [existingChapter] = await db
    .select({ id: courseChapters.id, courseId: courseChapters.courseId })
    .from(courseChapters)
    .where(eq(courseChapters.id, input.chapterId))
    .limit(1);

  if (!existingChapter) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.chapters.notFound,
    };
  }

  // 2. Determine position if not provided
  let position = input.position;
  if (!position) {
    const [maxResult] = await db
      .select({ maxPos: sql<string>`COALESCE(MAX(position), 0)` })
      .from(courseLectures)
      .where(eq(courseLectures.chapterId, input.chapterId));

    const nextVal = Number(maxResult?.maxPos ?? 0) + 1;
    position = String(nextVal);
  }

  // 3. Insert new lecture
  const [newLecture] = await db
    .insert(courseLectures)
    .values({
      chapterId: input.chapterId,
      title: input.title,
      description: input.description,
      type: input.type,
      referenceUrl: input.referenceUrl,
      extra: input.extra ?? {},
      createdByUserId,
      position,
      isActive: input.isActive ?? true,
    })
    .returning();

  // 4. Recalculate stats asynchronously
  recalculateChapterLectureStats(input.chapterId, existingChapter.courseId).catch((err) =>
    console.error({ err, chapterId: input.chapterId }, "[CreateLecture] Stats recalculation failed"),
  );

  return {
    success: true,
    data: {
      ...newLecture,
      type: newLecture.type as any,
      createdAt: newLecture.createdAt.toISOString(),
      updatedAt: newLecture.updatedAt.toISOString(),
    },
  };
}
