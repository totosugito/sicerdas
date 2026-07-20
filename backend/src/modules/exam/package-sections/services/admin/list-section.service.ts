import { db } from "../../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../../db/schema/exam/package-sections.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { and, eq, sql, desc, ilike } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { AdminSectionListParams, AdminSectionItemT } from "../../package-sections.schema.ts";

export interface AdminListSectionResult extends ServiceResponse {
  data?: {
    package: { packageId: string; packageName: string };
    items: AdminSectionItemT[];
    meta: PaginationMeta;
  };
}

export async function adminListSectionService(
  params: AdminSectionListParams,
  isAdmin: boolean,
  latestVersionId?: number,
): Promise<AdminListSectionResult> {
  const {
    search,
    packageId,
    isActive,
    sortBy = "updatedAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  const offset = (page - 1) * limit;

  let returnPackageId = "";
  let returnPackageName = "";

  const conditions: any[] = [];

  if (search) {
    conditions.push(ilike(examPackageSections.title, `%${search}%`));
  }

  if (packageId) {
    const existingPackage = await db.query.examPackages.findFirst({
      where: eq(examPackages.id, packageId),
      columns: { id: true, title: true },
    });

    if (!existingPackage) {
      return {
        success: false,
        statusCode: 404,
        errorKey: ($) => $.exam.packages.detail.notFound,
      };
    }

    returnPackageId = existingPackage.id;
    returnPackageName = existingPackage.title;

    conditions.push(eq(examPackageSections.packageId, packageId));
  }

  let activeSortBy = sortBy;

  if (!isAdmin) {
    conditions.push(eq(examPackageSections.isActive, true));
    if (activeSortBy === "isActive") activeSortBy = "order";
  } else {
    if (isActive !== undefined) conditions.push(eq(examPackageSections.isActive, isActive));
  }

  let baseQuery = db
    .select({
      section: examPackageSections,
      packageName: examPackages.title,
      isNew: latestVersionId
        ? sql<boolean>`${examPackageSections.versionId} = ${latestVersionId}`.as("isNew")
        : sql<boolean>`false`.as("isNew"),
    })
    .from(examPackageSections)
    .leftJoin(examPackages, eq(examPackageSections.packageId, examPackages.id));

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  let queryWithSort;

  switch (activeSortBy) {
    case "totalQuestions":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.totalQuestions)
          : baseQuery.orderBy(desc(examPackageSections.totalQuestions));
      break;
    case "activeQuestions":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.activeQuestions)
          : baseQuery.orderBy(desc(examPackageSections.activeQuestions));
      break;
    case "isActive":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.isActive)
          : baseQuery.orderBy(desc(examPackageSections.isActive));
      break;
    case "updatedAt":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.updatedAt)
          : baseQuery.orderBy(desc(examPackageSections.updatedAt));
      break;
    case "durationMinutes":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.durationMinutes)
          : baseQuery.orderBy(desc(examPackageSections.durationMinutes));
      break;
    case "createdAt":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.createdAt)
          : baseQuery.orderBy(desc(examPackageSections.createdAt));
      break;
    case "title":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.title)
          : baseQuery.orderBy(desc(examPackageSections.title));
      break;
    case "groupName":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.groupName)
          : baseQuery.orderBy(desc(examPackageSections.groupName));
      break;
    case "versionId":
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.versionId)
          : baseQuery.orderBy(desc(examPackageSections.versionId));
      break;
    case "order":
    default:
      queryWithSort =
        orderDir === "asc"
          ? baseQuery.orderBy(examPackageSections.order)
          : baseQuery.orderBy(desc(examPackageSections.order));
      break;
  }

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(queryWithSort.as("subquery"));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const items = await queryWithSort.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      package: {
        packageId: returnPackageId,
        packageName: returnPackageName,
      },
      items: items.map((r) => {
        const s = r.section;
        return {
          ...s,
          packageName: r.packageName,
          versionId: s.versionId,
          isNew: !!r.isNew,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        };
      }),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    },
  };
}
