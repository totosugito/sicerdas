import { db } from "../../../../../db/db-pool.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { and, eq, ne } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminUpdateCourseInput, CourseItem } from "../../courses.schema.ts";

export interface UpdateCourseResult extends ServiceResponse {
  data?: CourseItem;
}

export async function updateCourseService(
  id: string,
  input: AdminUpdateCourseInput,
): Promise<UpdateCourseResult> {
  // 1. Check if course exists
  const [existingCourse] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!existingCourse) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.courses.notFound,
    };
  }

  // 2. If courseCode is changing, ensure uniqueness
  if (input.courseCode && input.courseCode !== existingCourse.courseCode) {
    const [codeConflict] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.courseCode, input.courseCode), ne(courses.id, id)))
      .limit(1);

    if (codeConflict) {
      return {
        success: false,
        statusCode: 400,
        errorKey: ($) => $.course.courses.create.duplicateCode,
      };
    }
  }

  // 3. Update course
  const [updatedCourse] = await db
    .update(courses)
    .set({
      ...(input.courseCode && { courseCode: input.courseCode }),
      ...(input.courseName !== undefined && { courseName: input.courseName }),
      ...(input.courseDescription !== undefined && { courseDescription: input.courseDescription }),
      ...(input.whatYouWillLearn !== undefined && { whatYouWillLearn: input.whatYouWillLearn }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.educationGradeId !== undefined && { educationGradeId: input.educationGradeId }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.instructions !== undefined && { instructions: input.instructions }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.publishDateType !== undefined && { publishDateType: input.publishDateType }),
      ...(input.publishDateStart !== undefined && {
        publishDateStart: input.publishDateStart ? new Date(input.publishDateStart) : null,
      }),
      ...(input.publishDateEnd !== undefined && {
        publishDateEnd: input.publishDateEnd ? new Date(input.publishDateEnd) : null,
      }),
      ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
      ...(input.isSequential !== undefined && { isSequential: input.isSequential }),
      ...(input.versionId !== undefined && { versionId: input.versionId }),
      updatedAt: new Date(),
    })
    .where(eq(courses.id, id))
    .returning();

  return {
    success: true,
    data: {
      ...updatedCourse,
      price: updatedCourse.price ?? 0,
      tags: updatedCourse.tags ?? [],
      status: updatedCourse.status!,
      publishDateType: updatedCourse.publishDateType!,
      createdAt: updatedCourse.createdAt.toISOString(),
      updatedAt: updatedCourse.updatedAt.toISOString(),
      publishDateStart: updatedCourse.publishDateStart ? updatedCourse.publishDateStart.toISOString() : null,
      publishDateEnd: updatedCourse.publishDateEnd ? updatedCourse.publishDateEnd.toISOString() : null,
      category: null,
      grade: null,
    },
  };
}
