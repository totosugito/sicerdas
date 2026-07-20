import { db } from "../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageEventStats,
  examPackageInteractions,
} from "../../../../db/schema/exam/index.ts";
import { educationCategories, educationGrades } from "../../../../db/schema/education/index.ts";
import { and, eq, sql, ilike, desc, asc, inArray, gt } from "drizzle-orm";
import { EnumExamType } from "../../../../db/schema/exam/enums.ts";
import { getPackageThumbnailUrl } from "../../../../utils/exam/exam-utils.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { PaginationMeta } from "../../../../types/response.ts";
import type { PublicPackageListParams, PublicPackageItem } from "../packages.schema.ts";

export interface PublicListPackageResult extends ServiceResponse {
  data?: {
    items: PublicPackageItem[];
    meta: PaginationMeta;
  };
}

export async function publicListPackageService(
  params: PublicPackageListParams,
  userId: string | null,
  latestVersionId: number | null,
): Promise<PublicListPackageResult> {
  const {
    categoryId,
    categoryKey,
    educationGradeIds,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  const offset = (page - 1) * limit;
  const isLoggedIn = !!userId;

  const conditions = [];
  conditions.push(eq(examPackages.isActive, true));
  conditions.push(gt(examPackages.activeSections, 0));
  conditions.push(gt(examPackages.activeQuestions, 0));
  conditions.push(eq(examPackages.examType, EnumExamType.OFFICIAL));

  if (search && search.trim() !== "") {
    const searchTerm: string = `%${search.trim().toLowerCase()}%`;
    conditions.push(ilike(examPackages.title, searchTerm));
  }

  if (categoryId) {
    conditions.push(eq(examPackages.categoryId, categoryId));
  }

  if (categoryKey) {
    conditions.push(eq(educationCategories.key, categoryKey));
  }

  if (educationGradeIds && educationGradeIds.length > 0) {
    conditions.push(inArray(examPackages.educationGradeId, educationGradeIds));
  }

  // Build base query
  let baseQuery = db
    .select({
      id: examPackages.id,
      title: examPackages.title,
      description: examPackages.description,
      examType: examPackages.examType,
      durationMinutes: examPackages.durationMinutes,
      thumbnail: examPackages.thumbnail,
      requiredTier: examPackages.requiredTier,
      isActive: examPackages.isActive,
      activeSections: examPackages.activeSections,
      activeQuestions: examPackages.activeQuestions,
      createdAt: examPackages.createdAt,
      updatedAt: examPackages.updatedAt,
      category: {
        id: educationCategories.id,
        name: educationCategories.name,
        key: educationCategories.key,
      },
      grade: {
        id: educationGrades.id,
        name: educationGrades.name,
      },
      rating: examPackageEventStats.rating,
      viewCount: examPackageEventStats.viewCount,
      likeCount: examPackageEventStats.likeCount,
      bookmarkCount: examPackageEventStats.bookmarkCount,
      isNew: latestVersionId
        ? sql<boolean>`${examPackages.versionId} = ${latestVersionId}`.as("isNew")
        : sql<boolean>`false`.as("isNew"),
      liked: isLoggedIn ? examPackageInteractions.liked : sql<boolean | null>`NULL`.as("liked"),
      disliked: isLoggedIn
        ? examPackageInteractions.disliked
        : sql<boolean | null>`NULL`.as("disliked"),
      userRating: isLoggedIn
        ? examPackageInteractions.rating
        : sql<string | null>`NULL`.as("userRating"),
      bookmarked: isLoggedIn
        ? examPackageInteractions.bookmarked
        : sql<boolean | null>`NULL`.as("bookmarked"),
      interactionStatus: isLoggedIn
        ? examPackageInteractions.status
        : sql<string | null>`NULL`.as("interactionStatus"),
      completedSectionsCount: isLoggedIn
        ? examPackageInteractions.completedSectionsCount
        : sql<number | null>`NULL`.as("completedSectionsCount"),
    })
    .from(examPackages)
    .leftJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
    .leftJoin(examPackageEventStats, eq(examPackages.id, examPackageEventStats.packageId));

  if (isLoggedIn && userId) {
    baseQuery = baseQuery.leftJoin(
      examPackageInteractions,
      and(
        eq(examPackages.id, examPackageInteractions.packageId),
        eq(examPackageInteractions.userId, userId),
      ),
    );
  }

  const queryWithWhere = baseQuery.where(and(...conditions));

  // Sorting
  const order = sortOrder === "asc" ? "asc" : "desc";
  let query;

  switch (sortBy) {
    case "title":
      query =
        order === "asc"
          ? queryWithWhere.orderBy(asc(examPackages.title))
          : queryWithWhere.orderBy(desc(examPackages.title));
      break;
    case "rating":
      query =
        order === "asc"
          ? queryWithWhere.orderBy(asc(examPackageEventStats.rating))
          : queryWithWhere.orderBy(desc(examPackageEventStats.rating));
      break;
    case "viewCount":
      query =
        order === "asc"
          ? queryWithWhere.orderBy(asc(examPackageEventStats.viewCount))
          : queryWithWhere.orderBy(desc(examPackageEventStats.viewCount));
      break;
    case "createdAt":
    default:
      query =
        order === "asc"
          ? queryWithWhere.orderBy(asc(examPackages.createdAt))
          : queryWithWhere.orderBy(desc(examPackages.createdAt));
      break;
  }

  // Count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(query.as("subquery"));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  // Fetch
  const items = await query.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      items: items.map((item: any) => {
        const processedItem: PublicPackageItem = {
          id: item.id,
          title: item.title,
          description: item.description,
          examType: item.examType,
          durationMinutes: item.durationMinutes,
          thumbnail: getPackageThumbnailUrl(item.thumbnail),
          requiredTier: item.requiredTier,
          isActive: item.isActive,
          stats: {
            activeSections: item.activeSections,
            activeQuestions: item.activeQuestions,
            rating: item.rating !== null ? parseFloat(item.rating.toString()) : 0,
            viewCount: item.viewCount !== null ? item.viewCount : 0,
            likeCount: item.likeCount !== null ? item.likeCount : 0,
            bookmarkCount: item.bookmarkCount !== null ? item.bookmarkCount : 0,
          },
          category: item.category
            ? { id: item.category.id, name: item.category.name, key: item.category.key }
            : { id: "", name: "", key: "" },
          grade: item.grade
            ? { id: item.grade.id, name: item.grade.name }
            : { id: 0, name: "" },
          isNew: !!item.isNew,
          createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: item.updatedAt ? item.updatedAt.toISOString() : new Date().toISOString(),
        };

        if (isLoggedIn) {
          return {
            ...processedItem,
            userInteraction: {
              liked: item.liked !== undefined && item.liked !== null ? item.liked : false,
              disliked:
                item.disliked !== undefined && item.disliked !== null ? item.disliked : false,
              rating:
                item.userRating !== undefined && item.userRating !== null
                  ? parseFloat(item.userRating.toString())
                  : 0,
              bookmarked:
                item.bookmarked !== undefined && item.bookmarked !== null
                  ? item.bookmarked
                  : false,
              status:
                item.interactionStatus !== undefined && item.interactionStatus !== null
                  ? item.interactionStatus
                  : "not_started",
              completedSectionsCount:
                item.completedSectionsCount !== undefined &&
                item.completedSectionsCount !== null
                  ? item.completedSectionsCount
                  : 0,
            },
          };
        }

        return processedItem;
      }),
      meta: { total, page, limit, totalPages },
    },
  };
}
