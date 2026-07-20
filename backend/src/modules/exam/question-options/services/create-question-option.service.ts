import { db } from "../../../../db/db-pool.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import type { UploadedFile } from "../../../../types/file.ts";
import {
  processBlockNoteFiles,
  replaceBlockNoteUrls,
  resolveBlockNoteUrls,
  stripBlockNoteUrls,
} from "../../../../utils/blocknote/blocknote-utils.ts";
import { syncQuestionMaxScore } from "../../../../services/exam/index.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { CreateQuestionOptionParams, QuestionOptionResponseItemT } from "../question-options.schema.ts";

export interface CreateQuestionOptionResult extends ServiceResponse {
  data?: QuestionOptionResponseItemT;
}

export async function createQuestionOptionService(
  body: CreateQuestionOptionParams,
  files: UploadedFile[],
): Promise<CreateQuestionOptionResult> {
  const { questionId, content, isCorrect, score, order } = body;

  if (!questionId) {
    return { success: false, statusCode: 400, errorKey: ($) => $.exam.question_options.create.invalidQuestion };
  }

  // Verify that the parent question exists
  const existingQuestion = await db.query.examQuestions.findFirst({
    where: eq(examQuestions.id, questionId),
  });

  if (!existingQuestion) {
    return { success: false, statusCode: 400, errorKey: ($) => $.exam.question_options.create.invalidQuestion };
  }

  // Create the option first to get the ID
  const [newOption] = await db
    .insert(examQuestionOptions)
    .values({
      questionId,
      content: content || [],
      isCorrect: isCorrect !== undefined ? isCorrect : false,
      score: score !== undefined ? score : 0,
      order: order !== undefined ? order : 0,
    })
    .returning();

  // Process uploaded files if any
  let finalContent = content ? stripBlockNoteUrls(content) : [];

  if (files.length > 0) {
    const urlMap = await processBlockNoteFiles(
      env.server.uploadsQuestionDir,
      questionId,
      files,
      existingQuestion.createdAt, // Use parent question's createdAt for path consistency
    );

    // Replace blob URLs with final URLs in content
    finalContent = replaceBlockNoteUrls(finalContent, urlMap);

    // Update the option with final content
    await db
      .update(examQuestionOptions)
      .set({
        content: finalContent,
      })
      .where(eq(examQuestionOptions.id, newOption.id));
  }

  // Sync Question Max Score
  await syncQuestionMaxScore(questionId);

  return {
    success: true,
    data: {
      ...newOption,
      content: resolveBlockNoteUrls(finalContent),
    },
  };
}
