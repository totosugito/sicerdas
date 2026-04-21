import { db } from "../db/db-pool.ts";
import { educationCategoryGradeStats } from "../db/schema/education/index.ts";
import { examPackages } from "../db/schema/exam/index.ts";
import { eq, and, count, gt } from "drizzle-orm";
import { EnumContentType } from "../db/schema/enum/enum-app.ts";
import { EnumExamType } from "../db/schema/exam/enums.ts";

/**
 * Recalculates and updates the educationCategoryGradeStats for a specific combo.
 */
export const recalculateEducationStats = async (
  contentType: (typeof EnumContentType)[keyof typeof EnumContentType],
  categoryId: string,
  educationGradeId: number,
) => {
  let totalCount = 0;
  let activeCount = 0;

  if (contentType === EnumContentType.EXAM) {
    // Count Official Exam Packages
    const statsResult = await db
      .select({
        total: count(),
        // We need a second query or a conditional count for active
      })
      .from(examPackages)
      .where(
        and(
          eq(examPackages.categoryId, categoryId),
          eq(examPackages.educationGradeId, educationGradeId),
          eq(examPackages.examType, EnumExamType.OFFICIAL),
        ),
      );

    totalCount = Number(statsResult[0].total);

    const activeResult = await db
      .select({ active: count() })
      .from(examPackages)
      .where(
        and(
          eq(examPackages.categoryId, categoryId),
          eq(examPackages.educationGradeId, educationGradeId),
          eq(examPackages.examType, EnumExamType.OFFICIAL),
          eq(examPackages.isActive, true),
          gt(examPackages.activeSections, 0),
          gt(examPackages.activeQuestions, 0),
        ),
      );

    activeCount = Number(activeResult[0].active);
  }

  // Update or Insert the stats record
  // Drizzle doesn't have a built-in upsert for all dialects in a single line easily without raw or specific postgres syntax
  // but we can use ON CONFLICT
  await db
    .insert(educationCategoryGradeStats)
    .values({
      contentType,
      categoryId,
      educationGradeId,
      totalCount,
      activeCount,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        educationCategoryGradeStats.contentType,
        educationCategoryGradeStats.categoryId,
        educationCategoryGradeStats.educationGradeId,
      ],
      set: {
        totalCount,
        activeCount,
        updatedAt: new Date(),
      },
    });

  return { totalCount, activeCount };
};
