import { db } from "../../../../../db/db-pool.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminReorderLectureInput } from "../../lectures.schema.ts";

export async function reorderLectureService(
  chapterId: string,
  input: AdminReorderLectureInput,
): Promise<ServiceResponse> {
  await db.transaction(async (tx) => {
    for (const item of input.items) {
      await tx
        .update(courseLectures)
        .set({
          position: item.position,
          updatedAt: new Date(),
        })
        .where(eq(courseLectures.id, item.id));
    }
  });

  return {
    success: true,
  };
}
