import { db } from "../../../../../db/db-pool.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import { recalculateCourseChapterStats } from "../../../../../utils/course/course-stats-utils.ts";

export async function deleteChapterService(id: string): Promise<ServiceResponse> {
  const [existing] = await db
    .select({ id: courseChapters.id, courseId: courseChapters.courseId })
    .from(courseChapters)
    .where(eq(courseChapters.id, id))
    .limit(1);

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.chapters.notFound,
    };
  }

  await db.delete(courseChapters).where(eq(courseChapters.id, id));

  // Recalculate course chapter stats asynchronously
  recalculateCourseChapterStats(existing.courseId).catch((err) =>
    console.error({ err, courseId: existing.courseId }, "[DeleteChapter] Stats recalculation failed"),
  );

  return {
    success: true,
  };
}
