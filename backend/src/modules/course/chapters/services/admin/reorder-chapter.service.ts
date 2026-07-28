import { db } from "../../../../../db/db-pool.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminReorderChapterInput } from "../../chapters.schema.ts";

export async function reorderChapterService(
  courseId: string,
  input: AdminReorderChapterInput,
): Promise<ServiceResponse> {
  await db.transaction(async (tx) => {
    for (const item of input.items) {
      await tx
        .update(courseChapters)
        .set({
          position: item.position,
          updatedAt: new Date(),
        })
        .where(eq(courseChapters.id, item.id));
    }
  });

  return {
    success: true,
  };
}
