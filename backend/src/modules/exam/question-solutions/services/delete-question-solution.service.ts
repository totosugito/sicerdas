import { db } from "../../../../db/db-pool.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { cleanupBlockNoteFiles } from "../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { FastifyBaseLogger } from "fastify";

export async function deleteQuestionSolutionService(
  id: string,
  logger: FastifyBaseLogger,
): Promise<ServiceResponse> {
  // Ensure solution exists
  const existingSolution = await db.query.examQuestionSolutions.findFirst({
    where: eq(examQuestionSolutions.id, id),
  });

  if (!existingSolution) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.question_solutions.delete.notFound };
  }

  // Perform Hard Delete
  await db.delete(examQuestionSolutions).where(eq(examQuestionSolutions.id, id));

  // Clean up files from disk
  await cleanupBlockNoteFiles(
    existingSolution.content as any[],
    [],
    env.server.uploadsQuestionDir,
    ["image"],
    logger,
  );

  return { success: true };
}
