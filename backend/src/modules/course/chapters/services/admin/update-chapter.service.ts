import { db } from "../../../../../db/db-pool.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminUpdateChapterInput, ChapterItem } from "../../chapters.schema.ts";
import { recalculateCourseChapterStats } from "../../../../../utils/course/course-stats-utils.ts";

export interface UpdateChapterResult extends ServiceResponse {
  data?: ChapterItem;
}

export async function updateChapterService(
  id: string,
  input: AdminUpdateChapterInput,
): Promise<UpdateChapterResult> {
  const [existing] = await db
    .select({ id: courseChapters.id, courseId: courseChapters.courseId, isActive: courseChapters.isActive })
    .from(courseChapters)
    .where(eq(courseChapters.id, id))
    .limit(1);

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.chapters.notFound,
    };
  }

  const [updated] = await db
    .update(courseChapters)
    .set({
      ...(input.chapterName !== undefined && { chapterName: input.chapterName }),
      ...(input.position !== undefined && { position: input.position }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(courseChapters.id, id))
    .returning();

  if (input.isActive !== undefined && input.isActive !== existing.isActive) {
    recalculateCourseChapterStats(existing.courseId).catch((err) =>
      console.error({ err, courseId: existing.courseId }, "[UpdateChapter] Stats recalculation failed"),
    );
  }

  return {
    success: true,
    data: {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  };
}
