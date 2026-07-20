import { db } from "../../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageInteractions,
  examPackageEventStats,
} from "../../../../../db/schema/exam/index.ts";
import { educationCategories } from "../../../../../db/schema/education/index.ts";
import { and, eq, desc, sql } from "drizzle-orm";
import { getPackageThumbnailUrl } from "../../../../../utils/exam/exam-utils.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { FavoritesQueryParams } from "../../packages.schema.ts";

export interface FavoritePackageItem {
  id: string;
  title: string;
  category: { name: string };
  thumbnail: string | null;
  stats: {
    rating: number;
    activeQuestions: number;
    activeSections: number;
  };
  userInteraction: {
    status: string;
    completedSectionsCount: number;
  };
  bookmarkedAt: string;
}

export interface FavoritesResult extends ServiceResponse {
  data?: FavoritePackageItem[];
  pagination?: PaginationMeta;
}

export async function favoritesService(
  params: FavoritesQueryParams,
  userId: string,
): Promise<FavoritesResult> {
  const { page = 1, pageSize = 5 } = params;
  const offset = (page - 1) * pageSize;

  const whereClause = and(
    eq(examPackageInteractions.userId, userId),
    eq(examPackageInteractions.bookmarked, true),
    eq(examPackages.isActive, true),
  );

  // 1. Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(examPackageInteractions)
    .innerJoin(examPackages, eq(examPackageInteractions.packageId, examPackages.id))
    .where(whereClause);

  const total = Number(countResult?.count || 0);

  // 2. Get paginated data
  const favorites = await db
    .select({
      id: examPackages.id,
      title: examPackages.title,
      thumbnail: examPackages.thumbnail,
      activeQuestions: examPackages.activeQuestions,
      activeSections: examPackages.activeSections,
      categoryName: educationCategories.name,
      rating: examPackageEventStats.rating,
      status: examPackageInteractions.status,
      completedSectionsCount: examPackageInteractions.completedSectionsCount,
      bookmarkedAt: examPackageInteractions.updatedAt,
    })
    .from(examPackageInteractions)
    .innerJoin(examPackages, eq(examPackageInteractions.packageId, examPackages.id))
    .innerJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
    .leftJoin(examPackageEventStats, eq(examPackages.id, examPackageEventStats.packageId))
    .where(whereClause)
    .orderBy(desc(examPackageInteractions.updatedAt))
    .limit(pageSize)
    .offset(offset);

  return {
    success: true,
    data: favorites.map((item) => ({
      id: item.id,
      title: item.title,
      category: {
        name: item.categoryName,
      },
      thumbnail: getPackageThumbnailUrl(item.thumbnail),
      stats: {
        rating: item.rating !== null ? parseFloat(item.rating.toString()) : 0,
        activeQuestions: item.activeQuestions,
        activeSections: item.activeSections,
      },
      userInteraction: {
        status: item.status,
        completedSectionsCount: item.completedSectionsCount,
      },
      bookmarkedAt: item.bookmarkedAt.toISOString(),
    })),
    pagination: {
      total,
      page,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
