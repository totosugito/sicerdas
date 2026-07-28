import { db } from "../../../../../db/db-pool.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { educationGrades } from "../../../../../db/schema/education/grades.ts";
import { courseStats } from "../../../../../db/schema/course/course-stats.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { CourseItem } from "../../courses.schema.ts";

import { getCourseThumbnailUrl } from "../../../../../utils/course/course-utils.ts";

export interface DetailCourseResult extends ServiceResponse {
  data?: CourseItem;
}

export async function detailCourseService(id: string): Promise<DetailCourseResult> {
  const [result] = await db
    .select({
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
        averageRating: courseStats.averageRating,
      },
    })
    .from(courses)
    .leftJoin(educationCategories, eq(courses.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(courses.educationGradeId, educationGrades.id))
    .leftJoin(courseStats, eq(courses.id, courseStats.courseId))
    .where(eq(courses.id, id))
    .limit(1);

  if (!result) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.courses.notFound,
    };
  }

  const { course, category, grade, stats } = result;
  const rCount = stats?.ratingCount ?? stats?.totalRatings ?? 0;
  const avgRating = rCount === 0 ? 5.0 : Number(stats?.averageRating ?? 5.0);

  return {
    success: true,
    data: {
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
    },
  };
}
