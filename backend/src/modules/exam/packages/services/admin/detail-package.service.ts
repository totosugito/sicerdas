import { db } from "../../../../../db/db-pool.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { examPackageEventStats } from "../../../../../db/schema/exam/index.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { educationGrades } from "../../../../../db/schema/education/grades.ts";
import { eq, sql } from "drizzle-orm";
import { getPackageThumbnailUrl } from "../../../../../utils/exam/exam-utils.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminPackageDetailData } from "../../packages.schema.ts";

export interface AdminDetailPackageResult extends ServiceResponse {
  data?: AdminPackageDetailData;
}

export async function adminDetailPackageService(
  id: string,
  latestVersionId: number | null,
): Promise<AdminDetailPackageResult> {
  const [result] = await db
    .select({
      package: examPackages,
      category: {
        id: educationCategories.id,
        name: educationCategories.name,
        key: educationCategories.key,
      },
      grade: {
        id: educationGrades.id,
        name: educationGrades.name,
      },
      viewCount: examPackageEventStats.viewCount,
      likeCount: examPackageEventStats.likeCount,
      bookmarkCount: examPackageEventStats.bookmarkCount,
      rating: examPackageEventStats.rating,
      ratingCount: examPackageEventStats.ratingCount,
      isNew: latestVersionId
        ? sql<boolean>`${examPackages.versionId} = ${latestVersionId}`.as("isNew")
        : sql<boolean>`false`.as("isNew"),
    })
    .from(examPackages)
    .leftJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
    .leftJoin(examPackageEventStats, eq(examPackages.id, examPackageEventStats.packageId))
    .where(eq(examPackages.id, id))
    .limit(1);

  if (!result) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.detail.notFound,
    };
  }

  const pkg = result.package;

  return {
    success: true,
    data: {
      ...pkg,
      thumbnail: getPackageThumbnailUrl(pkg.thumbnail),
      category: result.category
        ? { id: result.category.id, name: result.category.name, key: result.category.key }
        : { id: "", name: "", key: "" },
      grade: result.grade
        ? { id: result.grade.id, name: result.grade.name }
        : { id: 0, name: "" },
      isNew: !!result.isNew,
      stats: {
        totalSections: pkg.totalSections,
        activeSections: pkg.activeSections,
        totalQuestions: pkg.totalQuestions,
        activeQuestions: pkg.activeQuestions,
        viewCount: result.viewCount ?? 0,
        likeCount: result.likeCount ?? 0,
        bookmarkCount: result.bookmarkCount ?? 0,
        rating:
          result.ratingCount && result.ratingCount > 0
            ? result.rating
              ? parseFloat(result.rating)
              : 0
            : 5.0,
        ratingCount: result.ratingCount ?? 0,
      },
      versionId: pkg.versionId,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
    },
  };
}
