import { db } from "../../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { courseStats } from "../../../../../db/schema/course/course-stats.ts";
import { eq, and, sql } from "drizzle-orm";

export async function rateCourseService(courseId: string, userId: string, rating: number) {
  // Check if user is enrolled in the course
  const enrollment = await db.query.courseEnrollments.findFirst({
    where: and(eq(courseEnrollments.courseId, courseId), eq(courseEnrollments.userId, userId)),
  });

  if (!enrollment) {
    return {
      success: false,
      statusCode: 403,
      errorKey: ($: any) => $.course.enrollments.enroll.alreadyEnrolled,
    };
  }

  const oldRating = enrollment.rating ? parseFloat(enrollment.rating.toString()) : 0;

  if (oldRating === rating) {
    return {
      success: true,
      data: {
        courseId,
        userId,
        rating,
      },
    };
  }

  // Update enrollment rating
  await db
    .update(courseEnrollments)
    .set({
      rating: rating.toFixed(2),
    })
    .where(eq(courseEnrollments.id, enrollment.id));

  const isFirstTime = oldRating === 0;
  const ratingDiff = rating - oldRating;

  // Insert or update courseStats incrementally
  await db
    .insert(courseStats)
    .values({
      courseId,
      totalRatings: 1,
      ratingCount: 1,
      ratingSum: rating.toFixed(2),
      averageRating: rating.toFixed(2),
      lastUpdated: new Date(),
    })
    .onConflictDoUpdate({
      target: courseStats.courseId,
      set: {
        ratingSum: sql`${courseStats.ratingSum} + ${ratingDiff}`,
        totalRatings: isFirstTime ? sql`${courseStats.totalRatings} + 1` : sql`${courseStats.totalRatings}`,
        ratingCount: isFirstTime ? sql`${courseStats.ratingCount} + 1` : sql`${courseStats.ratingCount}`,
        lastUpdated: new Date(),
      },
    });

  // Calculate averageRating based on the updated sum/count
  await db
    .update(courseStats)
    .set({
      averageRating: sql`CASE WHEN ${courseStats.totalRatings} > 0 THEN ${courseStats.ratingSum} / ${courseStats.totalRatings} ELSE 0 END`,
    })
    .where(eq(courseStats.courseId, courseId));

  return {
    success: true,
    data: {
      courseId,
      userId,
      rating,
    },
  };
}
