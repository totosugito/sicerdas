import { db } from "../../../../../db/db-pool.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminCreateCourseInput, CourseItem } from "../../courses.schema.ts";

export interface CreateCourseResult extends ServiceResponse {
  data?: CourseItem;
}

export async function createCourseService(
  input: AdminCreateCourseInput,
  createdByUserId: string,
): Promise<CreateCourseResult> {
  // 1. Check if courseCode is unique
  const [existingCode] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.courseCode, input.courseCode))
    .limit(1);

  if (existingCode) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.course.courses.create.duplicateCode,
    };
  }

  // 2. Insert new course
  const [newCourse] = await db
    .insert(courses)
    .values({
      createdByUserId,
      courseCode: input.courseCode,
      courseName: input.courseName,
      categoryId: input.categoryId,
      educationGradeId: input.educationGradeId,
      courseDescription: input.courseDescription,
      whatYouWillLearn: input.whatYouWillLearn,
      price: input.price ?? 0,
      tags: input.tags,
      instructions: input.instructions,
      status: input.status,
      publishDateType: input.publishDateType,
      publishDateStart: input.publishDateStart ? new Date(input.publishDateStart) : null,
      publishDateEnd: input.publishDateEnd ? new Date(input.publishDateEnd) : null,
      isPublic: input.isPublic ?? false,
      isSequential: input.isSequential ?? true,
    })
    .returning();

  return {
    success: true,
    data: {
      ...newCourse,
      price: newCourse.price ?? 0,
      tags: newCourse.tags ?? [],
      status: newCourse.status!,
      publishDateType: newCourse.publishDateType!,
      createdAt: newCourse.createdAt.toISOString(),
      updatedAt: newCourse.updatedAt.toISOString(),
      publishDateStart: newCourse.publishDateStart ? newCourse.publishDateStart.toISOString() : null,
      publishDateEnd: newCourse.publishDateEnd ? newCourse.publishDateEnd.toISOString() : null,
      category: null,
      grade: null,
    },
  };
}
