import { db } from "../../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { eq, and } from "drizzle-orm";

export async function toggleLikeService(courseId: string, userId: string) {
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

  const currentLiked = enrollment.liked ?? false;
  const newLiked = !currentLiked;

  await db
    .update(courseEnrollments)
    .set({
      liked: newLiked,
      disliked: newLiked ? false : enrollment.disliked,
    })
    .where(eq(courseEnrollments.id, enrollment.id));

  return {
    success: true,
    data: {
      courseId,
      userId,
      liked: newLiked,
      disliked: newLiked ? false : (enrollment.disliked ?? false),
    },
  };
}
