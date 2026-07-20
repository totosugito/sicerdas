import { db } from "../../../../db/db-pool.ts";
import {
  educationCategories,
  educationGrades,
  educationCategoryGradeStats,
} from "../../../../db/schema/education/index.ts";
import { eq, and, gt } from "drizzle-orm";
import { EnumContentType } from "../../../../db/schema/enum/enum-app.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { FilterParamsCategoryData } from "../packages.schema.ts";

export interface FilterParamsResult extends ServiceResponse {
  data?: FilterParamsCategoryData[];
}

export async function filterParamsService(): Promise<FilterParamsResult> {
  // Query categories and their related grade stats
  const result = await db
    .select({
      categoryId: educationCategories.id,
      categoryName: educationCategories.name,
      categoryKey: educationCategories.key,
      categoryDescription: educationCategories.description,
      gradeId: educationGrades.id,
      gradeName: educationGrades.name,
      activeCount: educationCategoryGradeStats.activeCount,
      totalCount: educationCategoryGradeStats.totalCount,
    })
    .from(educationCategories)
    .innerJoin(
      educationCategoryGradeStats,
      and(
        eq(educationCategoryGradeStats.categoryId, educationCategories.id),
        eq(educationCategoryGradeStats.contentType, EnumContentType.EXAM),
        gt(educationCategoryGradeStats.activeCount, 0),
      ),
    )
    .innerJoin(
      educationGrades,
      eq(educationGrades.id, educationCategoryGradeStats.educationGradeId),
    )
    .orderBy(educationCategories.name, educationGrades.id);

  // Group results by category
  const categoriesMap = new Map<string, FilterParamsCategoryData>();

  for (const row of result) {
    if (!categoriesMap.has(row.categoryId)) {
      categoriesMap.set(row.categoryId, {
        id: row.categoryId,
        name: row.categoryName,
        key: row.categoryKey,
        description: row.categoryDescription,
        grades: [],
      });
    }

    const category = categoriesMap.get(row.categoryId)!;
    category.grades.push({
      id: row.gradeId,
      name: row.gradeName,
      stats: {
        activeCount: row.activeCount,
        totalCount: row.totalCount,
      },
    });
  }

  return {
    success: true,
    data: Array.from(categoriesMap.values()),
  };
}
