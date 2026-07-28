import { db } from "../../db/db-pool.ts";
import { courses } from "../../db/schema/course/courses.ts";
import { courseChapters } from "../../db/schema/course/chapters.ts";
import { courseLectures } from "../../db/schema/course/lectures.ts";
import { eq, sql } from "drizzle-orm";

/**
 * Recalculates totalChapters and activeChapters counters for a given course.
 */
export async function recalculateCourseChapterStats(courseId: string): Promise<void> {
  const [stats] = await db
    .select({
      totalChapters: sql<number>`COUNT(*)`,
      activeChapters: sql<number>`COUNT(CASE WHEN ${courseChapters.isActive} = true THEN 1 END)`,
    })
    .from(courseChapters)
    .where(eq(courseChapters.courseId, courseId));

  await db
    .update(courses)
    .set({
      totalChapters: Number(stats?.totalChapters ?? 0),
      activeChapters: Number(stats?.activeChapters ?? 0),
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId));
}

/**
 * Recalculates totalLectures and activeLectures counters for a chapter and its course.
 */
export async function recalculateChapterLectureStats(
  chapterId: string,
  courseId?: string,
): Promise<void> {
  // 1. Recalculate for chapter
  const [chapterStats] = await db
    .select({
      totalLectures: sql<number>`COUNT(*)`,
      activeLectures: sql<number>`COUNT(CASE WHEN ${courseLectures.isActive} = true THEN 1 END)`,
    })
    .from(courseLectures)
    .where(eq(courseLectures.chapterId, chapterId));

  await db
    .update(courseChapters)
    .set({
      totalLectures: Number(chapterStats?.totalLectures ?? 0),
      activeLectures: Number(chapterStats?.activeLectures ?? 0),
      updatedAt: new Date(),
    })
    .where(eq(courseChapters.id, chapterId));

  // 2. Resolve courseId if not provided
  let targetCourseId = courseId;
  if (!targetCourseId) {
    const [chap] = await db
      .select({ courseId: courseChapters.courseId })
      .from(courseChapters)
      .where(eq(courseChapters.id, chapterId))
      .limit(1);

    targetCourseId = chap?.courseId;
  }

  // 3. Recalculate totalLectures and activeLectures for course across all chapters
  if (targetCourseId) {
    const [courseStats] = await db
      .select({
        totalLectures: sql<number>`COUNT(*)`,
        activeLectures: sql<number>`COUNT(CASE WHEN ${courseLectures.isActive} = true THEN 1 END)`,
      })
      .from(courseLectures)
      .innerJoin(courseChapters, eq(courseLectures.chapterId, courseChapters.id))
      .where(eq(courseChapters.courseId, targetCourseId));

    await db
      .update(courses)
      .set({
        totalLectures: Number(courseStats?.totalLectures ?? 0),
        activeLectures: Number(courseStats?.activeLectures ?? 0),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, targetCourseId));
  }
}
