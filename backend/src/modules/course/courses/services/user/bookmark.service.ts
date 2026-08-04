import { db } from "../../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { eq, and } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { BookmarkResponseT } from "../../courses.schema.ts";

export interface ToggleBookmarkResult extends ServiceResponse {
  data?: BookmarkResponseT["data"];
}

export async function toggleBookmarkService(
  courseId: string,
  userId: string,
): Promise<ToggleBookmarkResult> {
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

  const currentStatus = enrollment.bookmarked ?? false;
  const newStatus = !currentStatus;

  await db
    .update(courseEnrollments)
    .set({
      bookmarked: newStatus,
    })
    .where(eq(courseEnrollments.id, enrollment.id));

  return {
    success: true,
    data: {
      courseId,
      userId,
      bookmarked: newStatus,
    },
  };
}
