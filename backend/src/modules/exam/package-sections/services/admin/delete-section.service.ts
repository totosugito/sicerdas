import { db } from "../../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../../db/schema/exam/package-sections.ts";
import { examPackageQuestions } from "../../../../../db/schema/exam/package-questions.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { examSessions } from "../../../../../db/schema/exam/sessions.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";

export async function deleteSectionService(id: string): Promise<ServiceResponse> {
  const existing = await db.query.examPackageSections.findFirst({
    where: eq(examPackageSections.id, id),
  });

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.package_sections.delete.notFound,
    };
  }

  // Check if section is in use by any sessions
  const inUseCheck = await db.query.examSessions.findFirst({
    where: eq(examSessions.sectionId, id),
  });

  if (inUseCheck) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.exam.package_sections.delete.inUse,
    };
  }

  await db.transaction(async (tx) => {
    // Delete question mappings associated with this section
    await tx.delete(examPackageQuestions).where(eq(examPackageQuestions.sectionId, id));

    // Delete the section itself
    await tx.delete(examPackageSections).where(eq(examPackageSections.id, id));

    // Update counts and duration in the parent package in a single operation
    await tx
      .update(examPackages)
      .set({
        totalSections: sql`${examPackages.totalSections} - 1`,
        activeSections: existing.isActive ? sql`${examPackages.activeSections} - 1` : undefined,
        totalQuestions: sql`GREATEST(${examPackages.totalQuestions} - ${existing.totalQuestions}, 0)`,
        activeQuestions: sql`GREATEST(${examPackages.activeQuestions} - ${existing.activeQuestions}, 0)`,
        durationMinutes: sql`(
          SELECT COALESCE(SUM(${examPackageSections.durationMinutes}), 0)
          FROM ${examPackageSections}
          WHERE ${examPackageSections.packageId} = ${existing.packageId}
          AND ${examPackageSections.isActive} = true
        )`,
        updatedAt: new Date(),
      })
      .where(eq(examPackages.id, existing.packageId));
  });

  return { success: true };
}
