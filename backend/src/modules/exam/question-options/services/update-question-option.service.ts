import { db } from "../../../../db/db-pool.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import type { UploadedFile } from "../../../../types/file.ts";
import {
  cleanupBlockNoteFiles,
  processBlockNoteFiles,
  replaceBlockNoteUrls,
  resolveBlockNoteUrls,
  stripBlockNoteUrls,
} from "../../../../utils/blocknote/blocknote-utils.ts";
import { syncQuestionMaxScore } from "../../../../services/exam/index.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { UpdateQuestionOptionParams, QuestionOptionResponseItemT } from "../question-options.schema.ts";
import type { FastifyBaseLogger } from "fastify";

export interface UpdateQuestionOptionResult extends ServiceResponse {
  data?: QuestionOptionResponseItemT;
}

export async function updateQuestionOptionService(
  id: string,
  body: UpdateQuestionOptionParams,
  files: UploadedFile[],
  logger: FastifyBaseLogger,
): Promise<UpdateQuestionOptionResult> {
  const { questionId, content, isCorrect, score, order } = body;

  // Ensure option exists
  const existingOption = await db.query.examQuestionOptions.findFirst({
    where: eq(examQuestionOptions.id, id),
  });

  if (!existingOption) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.question_options.update.notFound };
  }

  // Verify new question exists if provided
  if (questionId !== undefined) {
    const existingQuestion = await db.query.examQuestions.findFirst({
      where: eq(examQuestions.id, questionId),
    });
    if (!existingQuestion) {
      return { success: false, statusCode: 400, errorKey: ($) => $.exam.question_options.update.invalidQuestion };
    }
  }

  // Process uploaded files if any
  let finalContent = content ? stripBlockNoteUrls(content) : (existingOption.content as any[]);
  const targetQuestionId = questionId || existingOption.questionId;

  if (files.length > 0) {
    // Fetch the parent question to get createdAt for path consistency
    const parentQuestion = await db.query.examQuestions.findFirst({
      where: eq(examQuestions.id, targetQuestionId),
    });

    const urlMap = await processBlockNoteFiles(
      env.server.uploadsQuestionDir,
      targetQuestionId,
      files,
      parentQuestion?.createdAt,
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

  if (questionId !== undefined) updatePayload.questionId = questionId;
  if (content !== undefined) updatePayload.content = finalContent;
  if (isCorrect !== undefined) updatePayload.isCorrect = isCorrect;
  if (score !== undefined) updatePayload.score = score;
  if (order !== undefined) updatePayload.order = order;

  const [updatedOption] = await db
    .update(examQuestionOptions)
    .set(updatePayload)
    .where(eq(examQuestionOptions.id, id))
    .returning();

  // Clean up orphaned files
  if (content !== undefined) {
    await cleanupBlockNoteFiles(
      existingOption.content as any[],
      finalContent,
      env.server.uploadsQuestionDir,
      ["image"],
      logger,
    );
  }

  // Sync Question Max Score
  await syncQuestionMaxScore(targetQuestionId);

  return {
    success: true,
    data: {
      ...updatedOption,
      content: resolveBlockNoteUrls(updatedOption.content as any[]),
    },
  };
}
