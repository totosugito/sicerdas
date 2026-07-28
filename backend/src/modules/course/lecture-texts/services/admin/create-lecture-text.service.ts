import { db } from "../../../../../db/db-pool.ts";
import { courseLectureTexts } from "../../../../../db/schema/course/lecture-texts.ts";
import { eq } from "drizzle-orm";
import env from "../../../../../config/env.config.ts";
import {
  stripBlockNoteUrls,
  processBlockNoteFiles,
  replaceBlockNoteUrls,
  resolveBlockNoteUrls,
} from "../../../../../utils/blocknote/blocknote-utils.ts";
import type { UploadedFile } from "../../../../../types/file.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminCreateLectureTextInput, LectureTextItem } from "../../lecture-texts.schema.ts";

export interface CreateLectureTextResult extends ServiceResponse {
  data?: LectureTextItem;
}

export async function createLectureTextService(
  input: AdminCreateLectureTextInput,
  createdByUserId: string,
  files: UploadedFile[] = [],
): Promise<CreateLectureTextResult> {
  let finalContent = input.content ? stripBlockNoteUrls(input.content) : [];

  const [newText] = await db
    .insert(courseLectureTexts)
    .values({
      title: input.title,
      content: finalContent,
      createdByUserId,
    })
    .returning();

  if (files.length > 0) {
    const urlMap = await processBlockNoteFiles(
      env.server.uploadsLectureDir,
      newText.id,
      files,
      newText.createdAt,
    );

    finalContent = replaceBlockNoteUrls(finalContent, urlMap);

    await db
      .update(courseLectureTexts)
      .set({ content: finalContent })
      .where(eq(courseLectureTexts.id, newText.id));
  }

  return {
    success: true,
    data: {
      ...newText,
      content: resolveBlockNoteUrls(finalContent),
      createdAt: newText.createdAt.toISOString(),
      updatedAt: newText.updatedAt.toISOString(),
    },
  };
}
