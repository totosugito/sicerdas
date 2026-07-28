import { db } from "../../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageSections,
  examPackageQuestions,
} from "../../../../../db/schema/exam/index.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { ClonePackageParams } from "../../packages.schema.ts";

export interface ClonePackageResult extends ServiceResponse {
  data?: {
    id: string;
    parentPackageId: string | null;
    title: string;
    examType: string;
    totalSections: number;
    totalQuestions: number;
  };
}

export async function clonePackageService(
  params: ClonePackageParams,
  userId: string,
): Promise<ClonePackageResult> {
  const { sourcePackageId, title, examType } = params;

  // 1. Fetch original package
  const sourcePackage = await db.query.examPackages.findFirst({
    where: eq(examPackages.id, sourcePackageId),
  });

  if (!sourcePackage) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.delete.notFound,
    };
  }

  // 2. Fetch original sections
  const sourceSections = await db.query.examPackageSections.findMany({
    where: eq(examPackageSections.packageId, sourcePackageId),
  });

  // 3. Duplicate inside a transaction
  const clonedPackage = await db.transaction(async (tx) => {
    // Insert new cloned package
    const [newPkg] = await tx
      .insert(examPackages)
      .values({
        categoryId: sourcePackage.categoryId,
        title: title || `Cloned - ${sourcePackage.title}`,
        examType: examType || sourcePackage.examType,
        createdByUserId: userId,
        durationMinutes: sourcePackage.durationMinutes,
        description: sourcePackage.description,
        requiredTier: sourcePackage.requiredTier,
        educationGradeId: sourcePackage.educationGradeId,
        isActive: sourcePackage.isActive,
        versionId: sourcePackage.versionId,
        thumbnail: sourcePackage.thumbnail,
        parentPackageId: sourcePackageId,
        totalSections: sourcePackage.totalSections,
        activeSections: sourcePackage.activeSections,
        totalQuestions: sourcePackage.totalQuestions,
        activeQuestions: sourcePackage.activeQuestions,
      })
      .returning();

    // Map section IDs to duplicate questions
    for (const section of sourceSections) {
      const [newSec] = await tx
        .insert(examPackageSections)
        .values({
          packageId: newPkg.id,
          groupName: section.groupName,
          title: section.title,
          description: section.description,
          durationMinutes: section.durationMinutes,
          questionLimit: section.questionLimit,
          maxScore: section.maxScore,
          versionId: section.versionId,
          totalQuestions: section.totalQuestions,
          activeQuestions: section.activeQuestions,
        })
        .returning();

      // Fetch questions in original section
      const sourceQuestions = await tx.query.examPackageQuestions.findMany({
        where: eq(examPackageQuestions.sectionId, section.id),
      });

      if (sourceQuestions.length > 0) {
        await tx.insert(examPackageQuestions).values(
          sourceQuestions.map((q) => ({
            packageId: newPkg.id,
            sectionId: newSec.id,
            questionId: q.questionId,
            order: q.order,
          })),
        );
      }
    }

    return newPkg;
  });

  return {
    success: true,
    data: {
      id: clonedPackage.id,
      parentPackageId: clonedPackage.parentPackageId,
      title: clonedPackage.title,
      examType: clonedPackage.examType,
      totalSections: clonedPackage.totalSections,
      totalQuestions: clonedPackage.totalQuestions,
    },
  };
}
