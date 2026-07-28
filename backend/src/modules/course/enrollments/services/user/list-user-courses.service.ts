import { db } from "../../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { EnumEnrollmentStatus } from "../../../../../db/schema/course/enums.ts";
import { eq, and, count, desc } from "drizzle-orm";
import type { ServiceResponse, PaginationMeta } from "../../../../../types/response.ts";
import type { UserCourseListQueryParams } from "../../enrollments.schema.ts";

export interface ListUserCoursesResult extends ServiceResponse {
  data?: Array<{
    enrollmentId: string;
    status: string;
    enrolledAt: string;
    completedAt: string | null;
    course: {
      id: string;
      courseCode: string;
      courseName: string;
      courseDescription: string | null;
      thumbnail: string | null;
      price: number;
    };
  }>;
  pagination?: PaginationMeta;
}

export async function listUserCoursesService(
  userId: string,
  targetStatus: typeof EnumEnrollmentStatus.ACTIVE | typeof EnumEnrollmentStatus.COMPLETED,
  params: UserCourseListQueryParams,
): Promise<ListUserCoursesResult> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const whereClause = and(
    eq(courseEnrollments.userId, userId),
    eq(courseEnrollments.status, targetStatus),
  );

  // Total count
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(courseEnrollments)
    .where(whereClause);

  // Data rows
  const rows = await db
    .select({
      enrollmentId: courseEnrollments.id,
      status: courseEnrollments.status,
      enrolledAt: courseEnrollments.enrolledAt,
      completedAt: courseEnrollments.completedAt,
      courseId: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      courseDescription: courses.courseDescription,
      thumbnail: courses.thumbnail,
      price: courses.price,
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .where(whereClause)
    .orderBy(desc(courseEnrollments.enrolledAt))
    .limit(limit)
    .offset(offset);

  const data = rows.map((r) => ({
    enrollmentId: r.enrollmentId,
    status: r.status,
    enrolledAt: r.enrolledAt.toISOString(),
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    course: {
      id: r.courseId,
      courseCode: r.courseCode,
      courseName: r.courseName,
      courseDescription: r.courseDescription,
      thumbnail: r.thumbnail,
      price: Number(r.price),
    },
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return {
    success: true,
    data,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages,
    },
  };
}
