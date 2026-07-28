import { db } from "../../../../../db/db-pool.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import { deleteCourseDirectory } from "../../../../../utils/course/course-utils.ts";

export async function deleteCourseService(id: string): Promise<ServiceResponse> {
  const [existingCourse] = await db
    .select({ id: courses.id, createdAt: courses.createdAt })
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

  await db.delete(courses).where(eq(courses.id, id));

  // Clean up files (Fire and forget)
  deleteCourseDirectory(existingCourse.id, existingCourse.createdAt).catch((err) => {
    console.error(
      { err, id: existingCourse.id },
      "[DeleteCourse] Cleanup error",
    );
  });

  return {
    success: true,
  };
}
