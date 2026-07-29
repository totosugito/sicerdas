import { db } from "../../../../../db/db-pool.ts";
import { courseLectureTexts } from "../../../../../db/schema/course/lecture-texts.ts";
import { eq } from "drizzle-orm";
import env from "../../../../../config/env.config.ts";
import {
  stripBlockNoteUrls,
  cleanupBlockNoteFiles,
  processBlockNoteFiles,
  processExternalImages,
  replaceBlockNoteUrls,
  resolveBlockNoteUrls,
} from "../../../../../utils/blocknote/blocknote-utils.ts";
import type { UploadedFile } from "../../../../../types/file.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminUpdateLectureTextInput, LectureTextItem } from "../../lecture-texts.schema.ts";

export interface UpdateLectureTextResult extends ServiceResponse {
  data?: LectureTextItem;
}

export async function updateLectureTextService(
  id: string,
  input: AdminUpdateLectureTextInput,
  files: UploadedFile[] = [],
  logger?: any,
): Promise<UpdateLectureTextResult> {
  const [existing] = await db
    .select()
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

  let finalContent = existing.content;

  if (input.content !== undefined) {
    finalContent = stripBlockNoteUrls(input.content);

    finalContent = await processExternalImages(
      env.server.uploadsLectureDir,
      id,
      finalContent,
      existing.createdAt,
      ["image"],
      logger,
    );

    // Clean up unreferenced files from storage
    await cleanupBlockNoteFiles(
      existing.content,
      finalContent,
      env.server.uploadsLectureDir,
      ["image"],
      logger,
    );
  }

  if (files.length > 0) {
    const urlMap = await processBlockNoteFiles(
      env.server.uploadsLectureDir,
      id,
      files,
      existing.createdAt,
    );

    finalContent = replaceBlockNoteUrls(finalContent, urlMap);
  }

  const [updated] = await db
    .update(courseLectureTexts)
    .set({
      ...(input.title !== undefined && { title: input.title }),
      content: finalContent,
      updatedAt: new Date(),
    })
    .where(eq(courseLectureTexts.id, id))
    .returning();

  return {
    success: true,
    data: {
      ...updated,
      content: resolveBlockNoteUrls(updated.content),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  };
}
