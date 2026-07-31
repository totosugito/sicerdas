import { db } from "../../../../db/db-pool.ts";
import { courses } from "../../../../db/schema/course/courses.ts";
import { educationCategories } from "../../../../db/schema/education/categories.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { eq, count } from "drizzle-orm";
import { EnumContentStatus } from "../../../../db/schema/enum/enum-app.ts";
import type { ServiceResponse } from "../../../../types/index.ts";

export interface FilterParamsGrade {
  id: number;
  name: string;
  stats: {
    activeCount: number;
    totalCount: number;
  };
}

export interface FilterParamsCategoryData {
  id: string;
  name: string;
  key: string;
  description: string | null;
  grades: FilterParamsGrade[];
}

export interface FilterParamsResult extends ServiceResponse {
  data?: FilterParamsCategoryData[];
}

export async function filterParamsService(): Promise<FilterParamsResult> {
  const result = await db
    .select({
      categoryId: educationCategories.id,
      categoryName: educationCategories.name,
      categoryKey: educationCategories.key,
      categoryDescription: educationCategories.description,
      gradeId: educationGrades.id,
      gradeName: educationGrades.name,
      courseCount: count(courses.id),
    })
    .from(courses)
    .innerJoin(educationCategories, eq(courses.categoryId, educationCategories.id))
    .innerJoin(educationGrades, eq(courses.educationGradeId, educationGrades.id))
    .where(eq(courses.status, EnumContentStatus.PUBLISHED))
    .groupBy(
      educationCategories.id,
      educationCategories.name,
      educationCategories.key,
      educationCategories.description,
      educationGrades.id,
      educationGrades.name
    )
    .orderBy(educationCategories.name, educationGrades.id);

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
        activeCount: Number(row.courseCount),
        totalCount: Number(row.courseCount),
      },
    });
  }

  return {
    success: true,
    data: Array.from(categoriesMap.values()),
  };
}
