import { db } from "../../../../../db/db-pool.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { courseUserProgress } from "../../../../../db/schema/course/user-progress.ts";
import { courseUserStatsGlobal } from "../../../../../db/schema/course/user-stats-global.ts";
import { eq, and, sql } from "drizzle-orm";

export async function updateWatchTimeService(
  lectureId: string,
  userId: string,
  watchTimeSeconds: number
) {
  // 1. Fetch lecture details
  const lecture = await db.query.courseLectures.findFirst({
    where: and(eq(courseLectures.id, lectureId), eq(courseLectures.isActive, true)),
  });

  if (!lecture) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($: any) => $.course.lectures.detail.notFound,
    };
  }

  // 2. Fetch chapter details to get courseId
  const chapter = await db.query.courseChapters.findFirst({
    where: eq(courseChapters.id, lecture.chapterId),
  });

  if (!chapter) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($: any) => $.course.chapters.detail.notFound,
    };
  }

  const courseId = chapter.courseId;
  const now = new Date();

  // 3. Upsert user progress record
  const existingProgress = await db.query.courseUserProgress.findFirst({
    where: and(
      eq(courseUserProgress.userId, userId),
      eq(courseUserProgress.courseId, courseId),
      eq(courseUserProgress.lectureId, lectureId)
    ),
  });

  const prevWatchTime = existingProgress?.watchTimeSeconds ?? 0;
  const incrementalWatchTimeSeconds = Math.max(0, watchTimeSeconds - prevWatchTime);
  const incrementalWatchTimeMinutes = (incrementalWatchTimeSeconds / 60).toFixed(2);

  if (existingProgress) {
    await db
      .update(courseUserProgress)
      .set({
        watchTimeSeconds,
        updatedAt: now,
      })
      .where(eq(courseUserProgress.id, existingProgress.id));
  } else {
    await db.insert(courseUserProgress).values({
      userId,
      courseId,
      lectureId,
      watchTimeSeconds,
    });
  }

  // 4. Update global stats totalWatchTimeMinutes
  if (incrementalWatchTimeSeconds > 0) {
    await db
      .insert(courseUserStatsGlobal)
      .values({
        userId,
        totalCoursesEnrolled: 1,
        totalWatchTimeMinutes: incrementalWatchTimeMinutes,
        lastActiveAt: now,
      })
      .onConflictDoUpdate({
        target: courseUserStatsGlobal.userId,
        set: {
          totalWatchTimeMinutes: sql`${courseUserStatsGlobal.totalWatchTimeMinutes} + ${incrementalWatchTimeMinutes}`,
          lastActiveAt: now,
          updatedAt: now,
        },
      });
  }

  return {
    success: true,
    data: {
      lectureId,
      courseId,
      watchTimeSeconds,
    },
  };
}
