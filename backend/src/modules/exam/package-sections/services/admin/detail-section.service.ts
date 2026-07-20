import { db } from "../../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../../db/schema/exam/package-sections.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { AdminSectionDetailData } from "../../package-sections.schema.ts";

export interface AdminDetailSectionResult extends ServiceResponse {
  data?: AdminSectionDetailData;
}

export async function adminDetailSectionService(
  id: string,
  latestVersionId?: number,
): Promise<AdminDetailSectionResult> {
  const [sectionResult] = await db
    .select({
      section: examPackageSections,
      packageName: examPackages.title,
      categoryId: examPackages.categoryId,
      educationGradeId: examPackages.educationGradeId,
      isNew: latestVersionId
        ? sql<boolean>`${examPackageSections.versionId} = ${latestVersionId}`
        : sql<boolean>`false`,
    })
    .from(examPackageSections)
    .innerJoin(examPackages, eq(examPackageSections.packageId, examPackages.id))
    .where(eq(examPackageSections.id, id))
    .limit(1);

  if (!sectionResult) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.package_sections.detail.notFound,
    };
  }

  const section = sectionResult.section;

  return {
    success: true,
    data: {
      id: section.id,
      packageId: section.packageId,
      packageName: sectionResult.packageName,
      title: section.title,
      groupName: section.groupName,
      description: section.description,
      durationMinutes: section.durationMinutes,
      order: section.order,
      isActive: section.isActive,
      versionId: section.versionId,
      categoryId: sectionResult.categoryId,
      educationGradeId: sectionResult.educationGradeId,
      isNew: !!sectionResult.isNew,
      createdAt: section.createdAt.toISOString(),
      updatedAt: section.updatedAt.toISOString(),
    },
  };
}
