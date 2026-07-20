import { db } from "../../../../../db/db-pool.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { examPackageEventStats } from "../../../../../db/schema/exam/index.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { educationGrades } from "../../../../../db/schema/education/grades.ts";
import { desc, ilike, and, sql, eq, asc } from "drizzle-orm";
import { getPackageThumbnailUrl } from "../../../../../utils/exam/exam-utils.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { AdminPackageListParams, AdminPackageItem } from "../../packages.schema.ts";

export interface AdminListPackageResult extends ServiceResponse {
  data?: {
    items: AdminPackageItem[];
    meta: PaginationMeta;
  };
}

export async function adminListPackageService(
  params: AdminPackageListParams,
  isAdmin: boolean,
  latestVersionId: number | null,
): Promise<AdminListPackageResult> {
  const {
    search,
    categoryId,
    categoryKey,
    examType,
    isActive,
    educationGradeId,
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  let { sortBy = "updatedAt" } = params;

  const offset = (page - 1) * limit;
  const conditions = [];

  if (!isAdmin) {
    // Client must only see active packages
    conditions.push(eq(examPackages.isActive, true));
    // Force sorting ignoring isActive for clients
    if (sortBy === "isActive") sortBy = "title";
  } else {
    // Admin can filter by active status
    if (isActive !== undefined) conditions.push(eq(examPackages.isActive, isActive));
  }

  if (categoryId) conditions.push(eq(examPackages.categoryId, categoryId));
  if (categoryKey) conditions.push(eq(educationCategories.key, categoryKey));
  if (examType) conditions.push(eq(examPackages.examType, examType as any));
  if (educationGradeId) conditions.push(eq(examPackages.educationGradeId, educationGradeId));

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(ilike(examPackages.title, searchTerm));
  }

  // Build Query
  let baseQuery = db
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
      isNew: latestVersionId
        ? sql<boolean>`${examPackages.versionId} = ${latestVersionId}`.as("isNew")
        : sql<boolean>`false`.as("isNew"),
    })
    .from(examPackages)
    .leftJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
    .leftJoin(examPackageEventStats, eq(examPackages.id, examPackageEventStats.packageId));

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  // Sorting
  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  let queryWithSort;

  switch (sortBy) {
    case "totalSections":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.totalSections))
          : baseQuery.orderBy(desc(examPackages.totalSections));
      break;
    case "activeSections":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.activeSections))
          : baseQuery.orderBy(desc(examPackages.activeSections));
      break;
    case "totalQuestions":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.totalQuestions))
          : baseQuery.orderBy(desc(examPackages.totalQuestions));
      break;
    case "activeQuestions":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.activeQuestions))
          : baseQuery.orderBy(desc(examPackages.activeQuestions));
      break;
    case "isActive":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.isActive))
          : baseQuery.orderBy(desc(examPackages.isActive));
      break;
    case "updatedAt":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.updatedAt))
          : baseQuery.orderBy(desc(examPackages.updatedAt));
      break;
    case "durationMinutes":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.durationMinutes))
          : baseQuery.orderBy(desc(examPackages.durationMinutes));
      break;
    case "categoryId":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.categoryId))
          : baseQuery.orderBy(desc(examPackages.categoryId));
      break;
    case "examType":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.examType))
          : baseQuery.orderBy(desc(examPackages.examType));
      break;
    case "educationGradeId":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.educationGradeId))
          : baseQuery.orderBy(desc(examPackages.educationGradeId));
      break;
    case "createdAt":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.createdAt))
          : baseQuery.orderBy(desc(examPackages.createdAt));
      break;
    case "versionId":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.versionId))
          : baseQuery.orderBy(desc(examPackages.versionId));
      break;
    case "title":
    default:
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(asc(examPackages.title))
          : baseQuery.orderBy(desc(examPackages.title));
      break;
  }

  // Count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(queryWithSort.as("subquery"));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  // Fetch
  const items = await queryWithSort.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      items: items.map((r) => {
        const p = r.package;
        return {
          ...p,
          thumbnail: getPackageThumbnailUrl(p.thumbnail),
          category: r.category
            ? { id: r.category.id, name: r.category.name, key: r.category.key }
            : { id: "", name: "", key: "" },
          grade: r.grade
            ? { id: r.grade.id, name: r.grade.name }
            : { id: 0, name: "" },
          stats: {
            totalSections: p.totalSections,
            activeSections: p.activeSections,
            totalQuestions: p.totalQuestions,
            activeQuestions: p.activeQuestions,
            viewCount: r.viewCount ?? 0,
            likeCount: r.likeCount ?? 0,
            bookmarkCount: r.bookmarkCount ?? 0,
            rating: r.rating ? parseFloat(r.rating) : 0,
          },
          isNew: !!r.isNew,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      meta: { total, page, limit, totalPages },
    },
  };
}
