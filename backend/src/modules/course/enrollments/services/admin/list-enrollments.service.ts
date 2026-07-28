import { db } from "../../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { users } from "../../../../../db/schema/users/users.ts";
import { eq, and, count, desc } from "drizzle-orm";
import type { ServiceResponse, PaginationMeta } from "../../../../../types/response.ts";
import type {
  AdminListEnrollmentsQueryParams,
  EnrollmentItem,
} from "../../enrollments.schema.ts";

export interface ListEnrollmentsResult extends ServiceResponse {
  data?: EnrollmentItem[];
  pagination?: PaginationMeta;
}

export async function listEnrollmentsService(
  courseId: string,
  params: AdminListEnrollmentsQueryParams,
): Promise<ListEnrollmentsResult> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const conditions = [eq(courseEnrollments.courseId, courseId)];
  if (params.status) {
    conditions.push(eq(courseEnrollments.status, params.status));
  }

  const whereClause = and(...conditions);

  // Total count
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(courseEnrollments)
    .where(whereClause);

  // Data rows
  const rows = await db
    .select({
      id: courseEnrollments.id,
      courseId: courseEnrollments.courseId,
      userId: courseEnrollments.userId,
      status: courseEnrollments.status,
      enrolledAt: courseEnrollments.enrolledAt,
      completedAt: courseEnrollments.completedAt,
      studentId: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(courseEnrollments)
    .leftJoin(users, eq(courseEnrollments.userId, users.id))
    .where(whereClause)
    .orderBy(desc(courseEnrollments.enrolledAt))
    .limit(limit)
    .offset(offset);

  const data: EnrollmentItem[] = rows.map((r) => ({
    id: r.id,
    courseId: r.courseId,
    userId: r.userId,
    status: r.status,
    enrolledAt: r.enrolledAt.toISOString(),
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    student: r.studentId
      ? {
          id: r.studentId,
          fullName: r.name,
          email: r.email,
          avatarUrl: r.image,
        }
      : undefined,
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
