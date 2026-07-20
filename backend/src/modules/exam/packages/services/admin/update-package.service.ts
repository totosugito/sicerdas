import { db } from "../../../../../db/db-pool.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { educationGrades } from "../../../../../db/schema/education/grades.ts";
import { eq } from "drizzle-orm";
import { EnumExamType } from "../../../../../db/schema/exam/enums.ts";
import { EnumContentType } from "../../../../../db/schema/enum/enum-app.ts";
import { recalculateEducationStats } from "../../../../../utils/education/education-stats-utils.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { UpdatePackageParams } from "../../packages.schema.ts";

export async function updatePackageService(
  id: string,
  params: UpdatePackageParams,
): Promise<ServiceResponse> {
  const {
    categoryId,
    title,
    examType,
    description,
    requiredTier,
    educationGradeId,
    isActive,
    versionId,
  } = params;

  const existing = await db.query.examPackages.findFirst({
    where: eq(examPackages.id, id),
  });

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.update.notFound,
    };
  }

  // 1. Check if category exists if provided
  if (categoryId) {
    const existingCategory = await db.query.educationCategories.findFirst({
      where: eq(educationCategories.id, categoryId),
    });

    if (!existingCategory) {
      return {
        success: false,
        statusCode: 404,
        errorKey: ($) => $.education.categories.update.notFound,
      };
    }
  }

  // 2. Check if education grade exists if provided
  if (educationGradeId) {
    const existingGrade = await db.query.educationGrades.findFirst({
      where: eq(educationGrades.id, educationGradeId),
    });

    if (!existingGrade) {
      return {
        success: false,
        statusCode: 404,
        errorKey: ($) => $.education.grades.update.notFound,
      };
    }
  }

  await db
    .update(examPackages)
    .set({
      categoryId,
      title,
      examType,
      description,
      requiredTier,
      educationGradeId,
      isActive,
      versionId,
      updatedAt: new Date(),
    })
    .where(eq(examPackages.id, id));

  // 3. Recalculate statistics if relevant fields changed
  const anyRelevantChange =
    (categoryId !== undefined && categoryId !== existing.categoryId) ||
    (educationGradeId !== undefined && educationGradeId !== existing.educationGradeId) ||
    (examType !== undefined && examType !== existing.examType) ||
    (isActive !== undefined && isActive !== existing.isActive);

  if (anyRelevantChange) {
    // Recalculate for OLD combo
    if (
      existing.examType === EnumExamType.OFFICIAL &&
      existing.educationGradeId &&
      existing.categoryId
    ) {
      recalculateEducationStats(
        EnumContentType.EXAM,
        existing.categoryId,
        existing.educationGradeId,
      ).catch((err) =>
        console.error(
          { err, categoryId: existing.categoryId, gradeId: existing.educationGradeId },
          "[UpdatePackage] Stats sync failed (old)",
        ),
      );
    }

    // Recalculate for NEW combo
    const newCategory = categoryId ?? existing.categoryId;
    const newGrade = educationGradeId ?? existing.educationGradeId;
    const newType = examType ?? existing.examType;

    if (
      newType === EnumExamType.OFFICIAL &&
      newGrade &&
      newCategory &&
      (newCategory !== existing.categoryId || newGrade !== existing.educationGradeId)
    ) {
      recalculateEducationStats(EnumContentType.EXAM, newCategory, newGrade).catch((err) =>
        console.error(
          { err, categoryId: newCategory, gradeId: newGrade },
          "[UpdatePackage] Stats sync failed (new)",
        ),
      );
    }
  }

  return {
    success: true,
  };
}
