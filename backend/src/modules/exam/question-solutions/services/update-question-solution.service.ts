import { db } from "../../../../db/db-pool.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
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
import type { ServiceResponse } from "../../../../types/index.ts";
import type { UpdateQuestionSolutionParams, QuestionSolutionResponseItemT } from "../question-solutions.schema.ts";
import type { FastifyBaseLogger } from "fastify";

export interface UpdateQuestionSolutionResult extends ServiceResponse {
  data?: QuestionSolutionResponseItemT;
}

export async function updateQuestionSolutionService(
  id: string,
  body: UpdateQuestionSolutionParams,
  files: UploadedFile[],
  logger: FastifyBaseLogger,
): Promise<UpdateQuestionSolutionResult> {
  const { questionId, title, content, solutionType, order, requiredTier } = body;

  // Ensure solution exists
  const existingSolution = await db.query.examQuestionSolutions.findFirst({
    where: eq(examQuestionSolutions.id, id),
  });

  if (!existingSolution) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.question_solutions.update.notFound };
  }

  // Verify new question exists if provided
  if (questionId !== undefined) {
    const existingQuestion = await db.query.examQuestions.findFirst({
      where: eq(examQuestions.id, questionId),
    });
    if (!existingQuestion) {
      return { success: false, statusCode: 400, errorKey: ($) => $.exam.question_solutions.update.invalidQuestion };
    }
  }

  // Process uploaded files if any
  let finalContent = content ? stripBlockNoteUrls(content) : (existingSolution.content as any[]);
  const targetQuestionId = questionId || existingSolution.questionId;

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
  if (title !== undefined) updatePayload.title = title;
  if (content !== undefined) updatePayload.content = finalContent;
  if (solutionType !== undefined) updatePayload.solutionType = solutionType;
  if (order !== undefined) updatePayload.order = order;
  if (requiredTier !== undefined) updatePayload.requiredTier = requiredTier;

  const [updatedSolution] = await db
    .update(examQuestionSolutions)
    .set(updatePayload)
    .where(eq(examQuestionSolutions.id, id))
    .returning();

  // Clean up orphaned files
  if (content !== undefined) {
    await cleanupBlockNoteFiles(
      existingSolution.content as any[],
      finalContent,
      env.server.uploadsQuestionDir,
      ["image"],
      logger,
    );
  }

  return {
    success: true,
    data: {
      ...updatedSolution,
      content: resolveBlockNoteUrls(updatedSolution.content as any[]),
      createdAt: updatedSolution.createdAt.toISOString(),
      updatedAt: updatedSolution.updatedAt.toISOString(),
    },
  };
}
