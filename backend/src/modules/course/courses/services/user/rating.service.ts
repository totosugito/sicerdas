import { db } from "../../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { courseStats } from "../../../../../db/schema/course/course-stats.ts";
import { eq, and, isNotNull } from "drizzle-orm";

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

  // Update enrollment rating
  await db
    .update(courseEnrollments)
    .set({
      rating: rating.toFixed(2),
    })
    .where(eq(courseEnrollments.id, enrollment.id));

  // Recalculate average rating and total ratings in course_stats
  const allRatings = await db.query.courseEnrollments.findMany({
    where: and(
      eq(courseEnrollments.courseId, courseId),
      isNotNull(courseEnrollments.rating)
    ),
  });

  const validRatings = allRatings.map((r) => Number(r.rating)).filter((r) => !isNaN(r));
  const totalRatings = validRatings.length;
  const averageRating = totalRatings > 0
    ? (validRatings.reduce((sum, val) => sum + val, 0) / totalRatings).toFixed(2)
    : "0.00";

  await db
    .insert(courseStats)
    .values({
      courseId,
      totalRatings,
      averageRating,
      lastUpdated: new Date(),
    })
    .onConflictDoUpdate({
      target: courseStats.courseId,
      set: {
        totalRatings,
        averageRating,
        lastUpdated: new Date(),
      },
    });

  return {
    success: true,
    data: {
      courseId,
      userId,
      rating,
    },
  };
}
