import { db } from "../../../../../db/db-pool.ts";
import { courseLectureTexts } from "../../../../../db/schema/course/lecture-texts.ts";
import { eq } from "drizzle-orm";
import env from "../../../../../config/env.config.ts";
import { deleteStorageDirectory } from "../../../../../platform/storage/storage.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";

export async function deleteLectureTextService(
  id: string,
  logger?: any,
): Promise<ServiceResponse> {
  const [existing] = await db
    .select({ id: courseLectureTexts.id, createdAt: courseLectureTexts.createdAt })
    .from(courseLectureTexts)
    .where(eq(courseLectureTexts.id, id))
    .limit(1);

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.lectureTexts.notFound,
    };
  }

  await db.delete(courseLectureTexts).where(eq(courseLectureTexts.id, id));

  // Clean up directory from storage/disk
  await deleteStorageDirectory(
    env.server.uploadsLectureDir,
    id,
    existing.createdAt,
    logger,
  );

  return {
    success: true,
  };
}
