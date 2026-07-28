import { db } from "../../../../../db/db-pool.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminUpdateLectureInput, LectureItem } from "../../lectures.schema.ts";
import { recalculateChapterLectureStats } from "../../../../../utils/course/course-stats-utils.ts";

export interface UpdateLectureResult extends ServiceResponse {
  data?: LectureItem;
}

export async function updateLectureService(
  id: string,
  input: AdminUpdateLectureInput,
): Promise<UpdateLectureResult> {
  const [existing] = await db
    .select({
      id: courseLectures.id,
      chapterId: courseLectures.chapterId,
      isActive: courseLectures.isActive,
    })
    .from(courseLectures)
    .where(eq(courseLectures.id, id))
    .limit(1);

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.lectures.notFound,
    };
  }

  const [updated] = await db
    .update(courseLectures)
    .set({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.referenceUrl !== undefined && { referenceUrl: input.referenceUrl }),
      ...(input.extra !== undefined && { extra: input.extra }),
      ...(input.position !== undefined && { position: input.position }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(courseLectures.id, id))
    .returning();

  if (input.isActive !== undefined && input.isActive !== existing.isActive) {
    recalculateChapterLectureStats(existing.chapterId).catch((err) =>
      console.error({ err, chapterId: existing.chapterId }, "[UpdateLecture] Stats recalculation failed"),
    );
  }

  return {
    success: true,
    data: {
      ...updated,
      type: updated.type as any,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  };
}
