import { db } from "../../../../../db/db-pool.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { educationCategories, educationGrades } from "../../../../../db/schema/education/index.ts";
import { courseStats } from "../../../../../db/schema/course/course-stats.ts";
import { and, eq, ilike, sql, desc, asc, inArray, or } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/response.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { CourseItem, CourseListQueryParams } from "../../courses.schema.ts";
import { getCourseThumbnailUrl } from "../../../../../utils/course/course-utils.ts";
import { EnumContentStatus } from "../../../../../db/schema/enum/enum-app.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { courseUserProgress } from "../../../../../db/schema/course/user-progress.ts";

export interface UserListCourseResult extends ServiceResponse {
  data?: {
    items: CourseItem[];
    meta: PaginationMeta;
  };
}

export async function userListCourseService(
  params: CourseListQueryParams,
  userId?: string,
): Promise<UserListCourseResult> {
  const {
    page = 1,
    limit = 10,
    search,
    categoryId,
    categoryKey,
    educationGradeId,
    educationGradeIds,
    sortBy = "createdAt",
    sortOrder = "desc",
    versionId,
  } = params;

  const offset = (page - 1) * limit;
  const conditions = [];

  // Public/User catalog lists only published & public courses
  conditions.push(eq(courses.status, EnumContentStatus.PUBLISHED));
  conditions.push(eq(courses.isPublic, true));

  if (versionId) {
    conditions.push(eq(courses.versionId, versionId));
  }

  if (categoryKey) {
    conditions.push(eq(educationCategories.key, categoryKey));
  }

  if (categoryId) {
    conditions.push(eq(courses.categoryId, categoryId));
  }

  if (educationGradeIds && educationGradeIds.length > 0) {
    conditions.push(inArray(courses.educationGradeId, educationGradeIds));
  } else if (educationGradeId) {
    conditions.push(eq(courses.educationGradeId, educationGradeId));
  }

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        ilike(courses.courseName, searchTerm),
        ilike(courses.courseDescription, searchTerm)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const userProgress = db
    .select({
      courseId: courseUserProgress.courseId,
      completedLectures: sql<number>`count(*) filter (where ${courseUserProgress.isCompleted} = true)`.as("completed_lectures"),
    })
    .from(courseUserProgress)
    .where(userId ? eq(courseUserProgress.userId, userId) : sql`false`)
    .groupBy(courseUserProgress.courseId)
    .as("user_course_progress");

  // Order logic
  const sortColumn = sortBy === "courseName" ? courses.courseName : courses.createdAt;
  const orderDirection = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  // 1. Fetch total count
  const [countResult] = await db
    .select({ total: sql<number>`count(*)` })
    .from(courses)
    .leftJoin(educationCategories, eq(courses.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(courses.educationGradeId, educationGrades.id))
    .where(whereClause);

  const total = Number(countResult?.total ?? 0);
  const totalPages = Math.ceil(total / limit);

  // 2. Fetch paginated items
  const selectFields: any = {
    course: courses,
    category: {
      id: educationCategories.id,
      name: educationCategories.name,
      key: educationCategories.key,
    },
    grade: {
      id: educationGrades.id,
      name: educationGrades.name,
      grade: educationGrades.grade,
    },
    stats: {
      totalStudents: courseStats.totalStudents,
      totalRatings: courseStats.totalRatings,
      ratingCount: courseStats.ratingCount,
      ratingSum: courseStats.ratingSum,
      averageRating: courseStats.averageRating,
    },
  };

  if (userId) {
    selectFields.enrollmentStatus = courseEnrollments.status;
    selectFields.completedLectures = userProgress.completedLectures;
  }

  let query = db
    .select(selectFields)
    .from(courses)
    .leftJoin(educationCategories, eq(courses.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(courses.educationGradeId, educationGrades.id))
    .leftJoin(courseStats, eq(courses.id, courseStats.courseId));

  if (userId) {
    query = query
      .leftJoin(courseEnrollments, and(eq(courses.id, courseEnrollments.courseId), eq(courseEnrollments.userId, userId)))
      .leftJoin(userProgress, eq(courses.id, userProgress.courseId)) as typeof query;
  }

  const rawItems = await query
    .where(whereClause)
    .orderBy(orderDirection)
    .limit(limit)
    .offset(offset);

  const items: CourseItem[] = rawItems.map((item: any) => {
    const { course, category, grade, stats, enrollmentStatus, completedLectures } = item;
    const rCount = stats?.ratingCount ?? stats?.totalRatings ?? 0;
    const avgRating = rCount === 0 ? 5.0 : Number(stats?.averageRating ?? 5.0);

    const resultItem: CourseItem = {
      ...course,
      thumbnail: getCourseThumbnailUrl(course.thumbnail),
      price: course.price ?? 0,
      tags: course.tags ?? [],
      status: course.status!,
      publishDateType: course.publishDateType!,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      publishDateStart: course.publishDateStart ? course.publishDateStart.toISOString() : null,
      publishDateEnd: course.publishDateEnd ? course.publishDateEnd.toISOString() : null,
      category: category?.id ? category : null,
      grade: grade?.id ? grade : null,
      enrolledCount: stats?.totalStudents ?? 0,
      totalRatings: rCount,
      averageRating: avgRating,
    };

    if (userId && enrollmentStatus) {
      resultItem.progress = {
        enrollmentStatus: enrollmentStatus,
        completedLectures: Number(completedLectures ?? 0),
        progressPercentage: course.totalLectures > 0
          ? Math.round((Number(completedLectures ?? 0) / course.totalLectures) * 100)
          : 0,
      };
    }

    return resultItem;
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
