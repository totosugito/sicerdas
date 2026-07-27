import { db } from "../../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageSections,
  examPackageQuestions,
  examQuestions,
  examQuestionTags,
} from "../../../../../db/schema/exam/index.ts";
import { and, eq, sql, inArray } from "drizzle-orm";
import { EnumExamType } from "../../../../../db/schema/exam/enums.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { GenerateCustomParams } from "../../packages.schema.ts";

export interface GenerateCustomResult extends ServiceResponse {
  data?: {
    packageId: string;
    sectionId: string;
  };
}

export async function generateCustomService(
  params: GenerateCustomParams,
  userId: string,
): Promise<GenerateCustomResult> {
  const {
    categoryId,
    educationGradeId,
    tagIds,
    limit = 10,
    packageTitle,
    sectionTitle,
  } = params;

  const defaultPackageTitle = `Latihan Kustom - ${new Date().toLocaleDateString("id-ID")}`;
  const defaultSectionTitle = "Latihan Utama";

  // 1. Find random questions matching criteria
  const selectedQuestions = await db
    .select({ id: examQuestions.id })
    .from(examQuestions)
    .innerJoin(examQuestionTags, eq(examQuestions.id, examQuestionTags.questionId))
    .where(
      and(
        eq(examQuestions.educationGradeId, educationGradeId),
        inArray(examQuestionTags.tagId, tagIds),
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  if (selectedQuestions.length === 0) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.generateCustom.noQuestions,
    };
  }

  // 2. Create the package
  const [newPackage] = await db
    .insert(examPackages)
    .values({
      categoryId,
      title: packageTitle || defaultPackageTitle,
      examType: EnumExamType.CUSTOM_PRACTICE,
      createdByUserId: userId,
      educationGradeId,
      isActive: true,
      requiredTier: "free",
      durationMinutes: selectedQuestions.length * 2, // Estimate 2 mins per question
      totalSections: 1,
      activeSections: 1,
      totalQuestions: selectedQuestions.length,
      activeQuestions: selectedQuestions.length,
    })
    .returning({ id: examPackages.id });

  // 3. Create a default section
  const [newSection] = await db
    .insert(examPackageSections)
    .values({
      packageId: newPackage.id,
      title: sectionTitle || defaultSectionTitle,
      order: 1,
      isActive: true,
      totalQuestions: selectedQuestions.length,
      activeQuestions: selectedQuestions.length,
      createdByUserId: userId,
    })
    .returning({ id: examPackageSections.id });

  // 4. Link questions
  const packageQuestionsData = selectedQuestions.map((q, index) => ({
    packageId: newPackage.id,
    sectionId: newSection.id,
    questionId: q.id,
    order: index + 1,
  }));

  await db.insert(examPackageQuestions).values(packageQuestionsData);

  return {
    success: true,
    data: {
      packageId: newPackage.id,
      sectionId: newSection.id,
    },
  };
}
