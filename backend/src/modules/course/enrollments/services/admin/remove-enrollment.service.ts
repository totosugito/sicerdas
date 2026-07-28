import { db } from "../../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { eq, and } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminRemoveEnrollmentInput } from "../../enrollments.schema.ts";

export async function removeEnrollmentService(
  params: AdminRemoveEnrollmentInput,
): Promise<ServiceResponse> {
  const { courseId, userId } = params;

  const existing = await db.query.courseEnrollments.findFirst({
    where: and(
      eq(courseEnrollments.courseId, courseId),
      eq(courseEnrollments.userId, userId),
    ),
  });

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.courses.notFound,
    };
  }

  await db
    .delete(courseEnrollments)
    .where(eq(courseEnrollments.id, existing.id));

  return {
    success: true,
  };
}
