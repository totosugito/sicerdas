import { db } from "../../../../db/db-pool.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
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
import type { ServiceResponse } from "../../../../types/index.ts";
import type { CreateQuestionSolutionParams, QuestionSolutionResponseItemT } from "../question-solutions.schema.ts";

export interface CreateQuestionSolutionResult extends ServiceResponse {
  data?: QuestionSolutionResponseItemT;
}

export async function createQuestionSolutionService(
  body: CreateQuestionSolutionParams,
  files: UploadedFile[],
): Promise<CreateQuestionSolutionResult> {
  const { questionId, title, content, solutionType, order, requiredTier } = body;

  if (!questionId) {
    return { success: false, statusCode: 400, errorKey: ($) => $.exam.question_solutions.create.invalidQuestion };
  }

  // Verify that the parent question exists
  const existingQuestion = await db.query.examQuestions.findFirst({
    where: eq(examQuestions.id, questionId),
  });

  if (!existingQuestion) {
    return { success: false, statusCode: 400, errorKey: ($) => $.exam.question_solutions.create.invalidQuestion };
  }

  // Create the solution record
  const [newSolution] = await db
    .insert(examQuestionSolutions)
    .values({
      questionId,
      title,
      content: content || [],
      solutionType,
      order: order !== undefined ? order : 0,
      requiredTier: requiredTier || "free",
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

    // Update the solution with final content
    await db
      .update(examQuestionSolutions)
      .set({
        content: finalContent,
      })
      .where(eq(examQuestionSolutions.id, newSolution.id));
  }

  return {
    success: true,
    data: {
      ...newSolution,
      content: resolveBlockNoteUrls(finalContent),
      createdAt: newSolution.createdAt.toISOString(),
      updatedAt: newSolution.updatedAt.toISOString(),
    },
  };
}
