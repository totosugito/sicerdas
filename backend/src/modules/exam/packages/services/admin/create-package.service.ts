import { db } from "../../../../../db/db-pool.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { educationGrades } from "../../../../../db/schema/education/grades.ts";
import { EnumExamType } from "../../../../../db/schema/exam/enums.ts";
import { eq } from "drizzle-orm";
import { EnumContentType } from "../../../../../db/schema/enum/enum-app.ts";
import { recalculateEducationStats } from "../../../../../utils/education/education-stats-utils.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { CreatePackageParams } from "../../packages.schema.ts";

export interface CreatePackageResult extends ServiceResponse {
  data?: { id: string };
}

export async function createPackageService(
  params: CreatePackageParams,
  userId: string,
): Promise<CreatePackageResult> {
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

  // 1. Check if category exists
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

  // 2. Check if education grade exists (if provided)
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

  const [newPackage] = await db
    .insert(examPackages)
    .values({
      categoryId,
      title,
      examType,
      description,
      requiredTier,
      educationGradeId,
      isActive: isActive ?? true,
      versionId,
      createdByUserId: userId,
    })
    .returning({ id: examPackages.id });

  // 3. Recalculate statistics if it's an official package
  if (examType === EnumExamType.OFFICIAL && educationGradeId) {
    recalculateEducationStats(EnumContentType.EXAM, categoryId, educationGradeId).catch(
      (err) => {
        console.error(
          { err, categoryId, educationGradeId },
          "[CreatePackage] Failed to recalculate stats",
        );
      },
    );
  }

  return {
    success: true,
    data: {
      id: newPackage.id,
    },
  };
}
