import { db } from "../../../../../db/db-pool.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { examSessions } from "../../../../../db/schema/exam/sessions.ts";
import { examPackageSections } from "../../../../../db/schema/exam/package-sections.ts";
import { examPackageQuestions } from "../../../../../db/schema/exam/package-questions.ts";
import { eq } from "drizzle-orm";
import { deletePackageDirectory } from "../../../../../utils/exam/exam-utils.ts";
import { EnumExamType } from "../../../../../db/schema/exam/enums.ts";
import { EnumContentType } from "../../../../../db/schema/enum/enum-app.ts";
import { recalculateEducationStats } from "../../../../../utils/education/education-stats-utils.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";

export async function deletePackageService(id: string): Promise<ServiceResponse> {
  const existing = await db.query.examPackages.findFirst({
    where: eq(examPackages.id, id),
  });

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.delete.notFound,
    };
  }

  // Check if package is in use by any sessions
  const inUseCheck = await db.query.examSessions.findFirst({
    where: eq(examSessions.packageId, id),
  });

  if (inUseCheck) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.exam.packages.delete.inUse,
    };
  }

  // Check if package has sections or question assignments
  const [hasContent] = await Promise.all([
    db.query.examPackageSections.findFirst({ where: eq(examPackageSections.packageId, id) }),
    db.query.examPackageQuestions.findFirst({ where: eq(examPackageQuestions.packageId, id) }),
  ]);

  if (hasContent) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.exam.packages.delete.hasContent,
    };
  }

  // Perform Hard Delete
  await db.delete(examPackages).where(eq(examPackages.id, id));

  // Clean up files (Fire and forget, don't block response as package logic is already done)
  deletePackageDirectory(existing.id, existing.createdAt).catch((err) => {
    console.error(
      { err, id: existing.id },
      "[DeletePackage] Cleanup error",
    );
  });

  // 2. Recalculate statistics if it was an official package
  if (existing.examType === EnumExamType.OFFICIAL && existing.educationGradeId) {
    recalculateEducationStats(
      EnumContentType.EXAM,
      existing.categoryId,
      existing.educationGradeId,
    ).catch((err) => {
      console.error(
        { err, categoryId: existing.categoryId, gradeId: existing.educationGradeId },
        "[DeletePackage] Stats sync failed",
      );
    });
  }

  return {
    success: true,
  };
}
