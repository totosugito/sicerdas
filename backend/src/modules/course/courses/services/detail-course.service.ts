import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../../../../db/db-pool.ts";
import { courseEnrollments } from "../../../../db/schema/course/course-enrollments.ts";
import { courseStats } from "../../../../db/schema/course/course-stats.ts";
import { courseUserProgress } from "../../../../db/schema/course/user-progress.ts";
import { courses } from "../../../../db/schema/course/courses.ts";
import { educationCategories, educationGrades } from "../../../../db/schema/education/index.ts";
import { EnumContentStatus } from "../../../../db/schema/enum/enum-app.ts";
import { getCourseThumbnailUrl } from "../../../../utils/course/course-utils.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { CourseUserDetail } from "../courses.schema.ts";

export interface UserDetailCourseResult extends ServiceResponse {
  data?: CourseUserDetail;
}

export async function userDetailCourseService(id: string, userId?: string): Promise<UserDetailCourseResult> {
  const enrollment = alias(courseEnrollments, "user_course_enrollment");
  const progress = db
    .select({
      courseId: courseUserProgress.courseId,
      completedLectures: sql<number>`count(*) filter (where ${courseUserProgress.isCompleted} = true)`.as("completed_lectures"),
    })
    .from(courseUserProgress)
    .where(userId ? eq(courseUserProgress.userId, userId) : sql`false`)
    .groupBy(courseUserProgress.courseId)
    .as("user_course_progress");

  const [result] = await db
    .select({
      course: courses,
      category: { id: educationCategories.id, name: educationCategories.name, key: educationCategories.key },
      grade: { id: educationGrades.id, name: educationGrades.name, grade: educationGrades.grade },
      stats: {
        totalStudents: courseStats.totalStudents,
        totalRatings: courseStats.totalRatings,
        ratingCount: courseStats.ratingCount,
        averageRating: courseStats.averageRating,
      },
      enrollmentStatus: enrollment.status,
      completedLectures: progress.completedLectures,
      rating: enrollment.rating,
      bookmarked: enrollment.bookmarked,
    })
    .from(courses)
    .leftJoin(educationCategories, eq(courses.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(courses.educationGradeId, educationGrades.id))
    .leftJoin(courseStats, eq(courses.id, courseStats.courseId))
    .leftJoin(enrollment, userId ? and(eq(courses.id, enrollment.courseId), eq(enrollment.userId, userId)) : sql`false`)
    .leftJoin(progress, eq(courses.id, progress.courseId))
    .where(and(eq(courses.id, id), eq(courses.status, EnumContentStatus.PUBLISHED)))
    .limit(1);

  if (!result) return { success: false, statusCode: 404, errorKey: ($) => $.course.courses.notFound };

  const ratingCount = result.stats?.totalRatings || result.stats?.ratingCount || 0;
  const completedLectures = Number(result.completedLectures ?? 0);
  const totalLectures = result.course.totalLectures ?? 0;

  return {
    success: true,
    data: {
      id: result.course.id,
      courseCode: result.course.courseCode,
      courseName: result.course.courseName,
      courseDescription: result.course.courseDescription,
      whatYouWillLearn: result.course.whatYouWillLearn,
      price: result.course.price ?? 0,
      thumbnail: getCourseThumbnailUrl(result.course.thumbnail),
      category: result.category?.id ? result.category : null,
      grade: result.grade?.id ? result.grade : null,
      totalChapters: result.course.totalChapters,
      totalLectures,
      enrolledCount: result.stats?.totalStudents ?? 0,
      totalRatings: ratingCount,
      averageRating: ratingCount === 0 ? 5 : Number(result.stats?.averageRating ?? 5),
      progress: result.enrollmentStatus
        ? {
            enrollmentStatus: result.enrollmentStatus,
            completedLectures,
            progressPercentage: totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0,
            rating: result.rating ? Number(result.rating) : null,
            bookmarked: result.bookmarked ?? false,
          }
        : null,
    },
  };
}
