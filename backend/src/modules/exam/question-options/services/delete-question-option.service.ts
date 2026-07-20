import { db } from "../../../../db/db-pool.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { cleanupBlockNoteFiles } from "../../../../utils/blocknote/blocknote-utils.ts";
import { syncQuestionMaxScore } from "../../../../services/exam/index.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { FastifyBaseLogger } from "fastify";

export async function deleteQuestionOptionService(
  id: string,
  logger: FastifyBaseLogger,
): Promise<ServiceResponse> {
  // Ensure option exists
  const existingOption = await db.query.examQuestionOptions.findFirst({
    where: eq(examQuestionOptions.id, id),
  });

  if (!existingOption) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.question_options.delete.notFound };
  }

  // Perform Hard Delete
  await db.delete(examQuestionOptions).where(eq(examQuestionOptions.id, id));

  // Clean up files from disk
  await cleanupBlockNoteFiles(
    existingOption.content as any[],
    [],
    env.server.uploadsQuestionDir,
    ["image"],
    logger,
  );

  // Sync Question Max Score
  await syncQuestionMaxScore(existingOption.questionId);

  return { success: true };
}
