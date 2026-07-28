import { db } from "../../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { users } from "../../../../../db/schema/users/users.ts";
import { EnumEnrollmentStatus } from "../../../../../db/schema/course/enums.ts";
import { eq, and } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminAddEnrollmentInput, EnrollmentItem } from "../../enrollments.schema.ts";

export interface AddEnrollmentResult extends ServiceResponse {
  data?: EnrollmentItem;
}

export async function addEnrollmentService(
  params: AdminAddEnrollmentInput,
): Promise<AddEnrollmentResult> {
  const { courseId, userId } = params;

  // 1. Check course existence
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.courses.notFound,
    };
  }

  // 2. Check user existence
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.auth.userNotFound,
    };
  }

  // 3. Check existing enrollment
  const existing = await db.query.courseEnrollments.findFirst({
    where: and(
      eq(courseEnrollments.courseId, courseId),
      eq(courseEnrollments.userId, userId),
    ),
  });

  if (existing) {
    // If dropped or inactive, reactivate
    const [updated] = await db
      .update(courseEnrollments)
      .set({ status: EnumEnrollmentStatus.ACTIVE, enrolledAt: new Date() })
      .where(eq(courseEnrollments.id, existing.id))
      .returning();

    return {
      success: true,
      data: {
        id: updated.id,
        courseId: updated.courseId,
        userId: updated.userId,
        status: updated.status,
        enrolledAt: updated.enrolledAt.toISOString(),
        completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
      },
    };
  }

  // 4. Create new enrollment
  const [created] = await db
    .insert(courseEnrollments)
    .values({
      courseId,
      userId,
      status: EnumEnrollmentStatus.ACTIVE,
    })
    .returning();

  return {
    success: true,
    data: {
      id: created.id,
      courseId: created.courseId,
      userId: created.userId,
      status: created.status,
      enrolledAt: created.enrolledAt.toISOString(),
      completedAt: created.completedAt ? created.completedAt.toISOString() : null,
    },
  };
}
