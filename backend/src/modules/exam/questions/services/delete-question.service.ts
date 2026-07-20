import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { deleteStorageDirectory } from "../../../../platform/storage/storage.ts";
import { syncSection, syncPassage, syncPackage } from "../../../../services/exam/index.ts";
import type { ServiceResponse } from "../../../../types/index.ts";

export async function deleteQuestionService(
  id: string,
  existingQuestion: { id: string; passageId: string | null; createdAt: Date },
  logger?: any,
): Promise<ServiceResponse> {
  await db.transaction(async (tx) => {
    // Identify related sections before deleting
    const relatedSections = await tx
      .select({
        sectionId: examPackageQuestions.sectionId,
        packageId: examPackageQuestions.packageId,
      })
      .from(examPackageQuestions)
      .where(eq(examPackageQuestions.questionId, id));

    // Perform Hard Delete. The database schema has `onDelete: 'cascade'` for options
    // and solutions, so they will be automatically deleted by PostgreSQL.
    await tx.delete(examQuestions).where(eq(examQuestions.id, id));

    // Recalculate each affected section and package
    const uniquePackageIds = [...new Set(relatedSections.map((rs) => rs.packageId))];

    for (const rs of relatedSections) {
      await syncSection(rs.sectionId, tx);
    }

    for (const pkgId of uniquePackageIds) {
      await syncPackage(pkgId, tx);
    }

    // If a passage was associated, update its counters
    if (existingQuestion.passageId) {
      await syncPassage(existingQuestion.passageId, tx);
    }
  });

  // Clean up directory from disk
  await deleteStorageDirectory(
    env.server.uploadsQuestionDir,
    id,
    existingQuestion.createdAt,
    logger,
  );

  return { success: true };
}
