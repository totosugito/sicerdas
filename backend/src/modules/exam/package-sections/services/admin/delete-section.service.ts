import { db } from "../../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../../db/schema/exam/package-sections.ts";
import { examPackageQuestions } from "../../../../../db/schema/exam/package-questions.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
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

  const inUseCheck = await db.query.examPackageQuestions.findFirst({
    where: eq(examPackageQuestions.sectionId, id),
  });

  if (inUseCheck) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.exam.package_sections.delete.inUse,
    };
  }

  await db.transaction(async (tx) => {
    await tx.delete(examPackageSections).where(eq(examPackageSections.id, id));

    await tx
      .update(examPackages)
      .set({
        totalSections: sql`${examPackages.totalSections} - 1`,
        activeSections: existing.isActive ? sql`${examPackages.activeSections} - 1` : undefined,
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
