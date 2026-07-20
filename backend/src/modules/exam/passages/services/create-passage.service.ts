import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import type { UploadedFile } from "../../../../types/file.ts";
import {
  processBlockNoteFiles,
  replaceBlockNoteUrls,
  resolveBlockNoteUrls,
  stripBlockNoteUrls,
} from "../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { CreatePassageParams, PassageResponseItemT } from "../passages.schema.ts";

export interface CreatePassageResult extends ServiceResponse {
  data?: PassageResponseItemT;
}

export async function createPassageService(
  userId: string,
  body: CreatePassageParams,
  files: UploadedFile[],
): Promise<CreatePassageResult> {
  const { title, content, isActive, subjectId } = body;

  if (!subjectId) {
    return { success: false, statusCode: 400, errorKey: ($) => $.exam.subjects.detail.notFound };
  }

  // Ensure subject exists
  const existingSubject = await db.query.examSubjects.findFirst({
    where: eq(examSubjects.id, subjectId),
  });

  if (!existingSubject) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.subjects.detail.notFound };
  }

  // Create the passage record first to get the ID
  const [newPassage] = await db
    .insert(examPassages)
    .values({
      title: title || null,
      content: content || [],
      isActive: isActive !== undefined ? isActive : true,
      subjectId,
      createdByUserId: userId,
    })
    .returning();

  // Process uploaded files if any
  let finalContent = content ? stripBlockNoteUrls(content) : [];

  if (files.length > 0) {
    const urlMap = await processBlockNoteFiles(
      env.server.uploadsPassageDir,
      newPassage.id,
      files,
      newPassage.createdAt,
    );

    // Replace blob URLs with final URLs in content
    finalContent = replaceBlockNoteUrls(finalContent, urlMap);

    // Update the passage with final content
    await db
      .update(examPassages)
      .set({
        content: finalContent,
      })
      .where(eq(examPassages.id, newPassage.id));
  }

  return {
    success: true,
    data: {
      ...newPassage,
      content: resolveBlockNoteUrls(finalContent),
      subjectName: existingSubject.name,
      createdAt: newPassage.createdAt.toISOString(),
      updatedAt: newPassage.updatedAt.toISOString(),
    },
  };
}
