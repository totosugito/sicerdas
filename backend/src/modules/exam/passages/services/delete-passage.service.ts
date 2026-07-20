import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { deleteStorageDirectory } from "../../../../platform/storage/storage.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { FastifyBaseLogger } from "fastify";

export async function deletePassageService(
  id: string,
  logger: FastifyBaseLogger,
): Promise<ServiceResponse> {
  // Ensure passage exists
  const existingPassage = await db.query.examPassages.findFirst({
    where: eq(examPassages.id, id),
  });

  if (!existingPassage) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.passages.delete.notFound };
  }

  // Prevent deletion if passage is still attached to any questions
  const attachedQuestions = await db.query.examQuestions.findFirst({
    where: eq(examQuestions.passageId, id),
  });

  if (attachedQuestions) {
    return { success: false, statusCode: 400, errorKey: ($) => $.exam.passages.delete.hasChildren };
  }

  // Perform Hard Delete
  await db.delete(examPassages).where(eq(examPassages.id, id));

  // Clean up directory from disk
  await deleteStorageDirectory(
    env.server.uploadsPassageDir,
    id,
    existingPassage.createdAt,
    logger,
  );

  return { success: true };
}
