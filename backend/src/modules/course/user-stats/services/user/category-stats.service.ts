import { db } from "../../../../../db/db-pool.ts";
import { courseUserStatsCategory } from "../../../../../db/schema/course/user-stats-category.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { eq, inArray } from "drizzle-orm";

export async function getCategoryStatsService(userId: string) {
  const categoryStatsList = await db.query.courseUserStatsCategory.findMany({
    where: eq(courseUserStatsCategory.userId, userId),
  });

  const categoryIds = categoryStatsList.map((c) => c.categoryId);
  const categoriesList = categoryIds.length > 0
    ? await db.query.educationCategories.findMany({
        where: inArray(educationCategories.id, categoryIds),
      })
    : [];

  const categoryMap = new Map(categoriesList.map((cat) => [cat.id, cat]));

  const items = categoryStatsList.map((stat) => {
    const cat = categoryMap.get(stat.categoryId);
    return {
      categoryId: stat.categoryId,
      categoryName: cat?.name ?? "",
      coursesEnrolled: stat.coursesEnrolled,
      coursesCompleted: stat.coursesCompleted,
    };
  });

  return {
    success: true,
    data: items,
  };
}
