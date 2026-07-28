import { db } from "../../../../../db/db-pool.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import { recalculateChapterLectureStats } from "../../../../../utils/course/course-stats-utils.ts";

export async function deleteLectureService(id: string): Promise<ServiceResponse> {
  const [existing] = await db
    .select({
      id: courseLectures.id,
      chapterId: courseLectures.chapterId,
    })
    .from(courseLectures)
    .where(eq(courseLectures.id, id))
    .limit(1);

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.lectures.notFound,
    };
  }

  await db.delete(courseLectures).where(eq(courseLectures.id, id));

  recalculateChapterLectureStats(existing.chapterId).catch((err) =>
    console.error({ err, chapterId: existing.chapterId }, "[DeleteLecture] Stats recalculation failed"),
  );

  return {
    success: true,
  };
}
