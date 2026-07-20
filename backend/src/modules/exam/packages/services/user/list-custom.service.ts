import { db } from "../../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageInteractions,
} from "../../../../../db/schema/exam/index.ts";
import { educationCategories, educationGrades } from "../../../../../db/schema/education/index.ts";
import { and, eq, desc, sql } from "drizzle-orm";
import { getPackageThumbnailUrl } from "../../../../../utils/exam/exam-utils.ts";
import { EnumExamPackageUserStatus, EnumExamType } from "../../../../../db/schema/exam/enums.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { ListCustomQueryParams, CustomPackageItem } from "../../packages.schema.ts";

export interface ListCustomResult extends ServiceResponse {
  data?: CustomPackageItem[];
  pagination?: PaginationMeta;
}

export async function listCustomService(
  params: ListCustomQueryParams,
  userId: string,
): Promise<ListCustomResult> {
  const { page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  const whereClause = and(
    eq(examPackages.createdByUserId, userId),
    eq(examPackages.examType, EnumExamType.CUSTOM_PRACTICE),
    eq(examPackages.isActive, true),
  );

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examPackages)
    .where(whereClause);

  const total = Number(countResult?.count || 0);

  const items = await db
    .select({
      id: examPackages.id,
      title: examPackages.title,
      thumbnail: examPackages.thumbnail,
      durationMinutes: examPackages.durationMinutes,
      activeQuestions: examPackages.activeQuestions,
      activeSections: examPackages.activeSections,
      categoryName: educationCategories.name,
      gradeName: educationGrades.name,
      status: examPackageInteractions.status,
      completedSectionsCount: examPackageInteractions.completedSectionsCount,
      createdAt: examPackages.createdAt,
    })
    .from(examPackages)
    .leftJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
    .leftJoin(
      examPackageInteractions,
      and(
        eq(examPackages.id, examPackageInteractions.packageId),
        eq(examPackageInteractions.userId, userId),
      ),
    )
    .where(whereClause)
    .orderBy(desc(examPackages.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    success: true,
    data: items.map((item) => ({
      id: item.id,
      title: item.title,
      thumbnail: getPackageThumbnailUrl(item.thumbnail),
      durationMinutes: item.durationMinutes,
      stats: {
        activeQuestions: item.activeQuestions,
        activeSections: item.activeSections,
      },
      category: { name: item.categoryName || "" },
      grade: { name: item.gradeName || "" },
      userInteraction: {
        status: (item.status || EnumExamPackageUserStatus.NOT_STARTED) as CustomPackageItem["userInteraction"]["status"],
        completedSectionsCount: item.completedSectionsCount || 0,
      },
      createdAt: item.createdAt.toISOString(),
    })),
    pagination: {
      total,
      page,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
