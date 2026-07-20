import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { and, eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import type { UploadedFile } from "../../../../types/file.ts";
import {
  cleanupBlockNoteFiles,
  processBlockNoteFiles,
  replaceBlockNoteUrls,
  resolveBlockNoteUrls,
  stripBlockNoteUrls,
} from "../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { UpdatePassageParams, PassageResponseItemT } from "../passages.schema.ts";
import type { FastifyBaseLogger } from "fastify";

export interface UpdatePassageResult extends ServiceResponse {
  data?: PassageResponseItemT;
}

export async function updatePassageService(
  id: string,
  body: UpdatePassageParams,
  files: UploadedFile[],
  logger: FastifyBaseLogger,
): Promise<UpdatePassageResult> {
  const { title, content, isActive, subjectId } = body;

  // Ensure passage exists
  const existingPassage = await db.query.examPassages.findFirst({
    where: eq(examPassages.id, id),
  });

  if (!existingPassage) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.passages.update.notFound };
  }

  // Process uploaded files if any
  let finalContent = content ? stripBlockNoteUrls(content) : (existingPassage.content as any[]);

  if (files.length > 0) {
    const urlMap = await processBlockNoteFiles(
      env.server.uploadsPassageDir,
      id,
      files,
      existingPassage.createdAt,
    );

    // Replace blob URLs with final URLs
    if (content !== undefined) {
      finalContent = replaceBlockNoteUrls(content, urlMap);
    }
  }

  // Build dynamic update payload
  const updatePayload: any = {
    updatedAt: new Date(),
  };

  if (title !== undefined) updatePayload.title = title;
  if (content !== undefined) updatePayload.content = finalContent;

  if (isActive !== undefined) {
    // Block deactivation if any active question still references this passage
    if (isActive === false && existingPassage.isActive === true) {
      const activeQuestion = await db.query.examQuestions.findFirst({
        columns: { id: true },
        where: and(eq(examQuestions.passageId, id), eq(examQuestions.isActive, true)),
      });

      if (activeQuestion) {
        return { success: false, statusCode: 400, errorKey: ($) => $.exam.passages.update.hasActiveQuestions };
      }
    }
    updatePayload.isActive = isActive;
  }

  if (subjectId !== undefined) {
    // Ensure subject exists
    const existingSubject = await db.query.examSubjects.findFirst({
      where: eq(examSubjects.id, subjectId),
    });

    if (!existingSubject) {
      return { success: false, statusCode: 404, errorKey: ($) => $.exam.subjects.detail.notFound };
    }

    updatePayload.subjectId = subjectId;
  }

  const [updatedPassage] = await db
    .update(examPassages)
    .set(updatePayload)
    .where(eq(examPassages.id, id))
    .returning();

  // Clean up orphaned files
  if (content !== undefined) {
    await cleanupBlockNoteFiles(
      existingPassage.content as any[],
      finalContent,
      env.server.uploadsPassageDir,
      ["image"],
      logger,
    );
  }

  // Get subject name for response
  const subject = await db.query.examSubjects.findFirst({
    where: eq(examSubjects.id, updatedPassage.subjectId),
  });

  return {
    success: true,
    data: {
      ...updatedPassage,
      content: resolveBlockNoteUrls(updatedPassage.content as any[]),
      subjectName: subject?.name || "",
      createdAt: updatedPassage.createdAt.toISOString(),
      updatedAt: updatedPassage.updatedAt.toISOString(),
    },
  };
}
