import { db } from "../../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { eq, and, or, sql } from "drizzle-orm";

export async function getFavoritesService(userId: string, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  // Filter enrollments where userId matches and bookmarked or liked is true
  const baseCondition = and(
    eq(courseEnrollments.userId, userId),
    or(eq(courseEnrollments.bookmarked, true), eq(courseEnrollments.liked, true))
  );

  const favoriteEnrollments = await db.query.courseEnrollments.findMany({
    where: baseCondition,
    limit,
    offset,
  });

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(courseEnrollments)
    .where(baseCondition);

  const total = Number(totalCountResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  const courseIds = favoriteEnrollments.map((e) => e.courseId);
  const coursesList = courseIds.length > 0
    ? await db.query.courses.findMany({
        where: sql`${courses.id} IN ${courseIds}`,
      })
    : [];

  const courseMap = new Map(coursesList.map((c) => [c.id, c]));

  const items = favoriteEnrollments.map((e) => {
    const course = courseMap.get(e.courseId);
    return {
      id: e.courseId,
      courseCode: course?.courseCode ?? "",
      courseName: course?.courseName ?? "",
      courseDescription: course?.courseDescription ?? null,
      thumbnail: course?.thumbnail ?? null,
      price: course?.price ?? 0,
      bookmarked: e.bookmarked ?? false,
      liked: e.liked ?? false,
      rating: e.rating ? Number(e.rating) : null,
    };
  });

  return {
    success: true,
    data: {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    },
  };
}
