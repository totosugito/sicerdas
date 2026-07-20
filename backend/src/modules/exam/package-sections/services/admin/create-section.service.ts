import { db } from "../../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../../db/schema/exam/package-sections.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { CreateSectionParams } from "../../package-sections.schema.ts";

export interface CreateSectionResult extends ServiceResponse {
  data?: { id: string };
}

export async function createSectionService(
  params: CreateSectionParams,
  userId: string,
): Promise<CreateSectionResult> {
  const {
    packageId,
    title,
    groupName,
    description,
    durationMinutes,
    order,
    isActive,
    versionId,
  } = params;

  let orderToUse = order ?? -1;

  const existingPackage = await db.query.examPackages.findFirst({
    where: eq(examPackages.id, packageId),
  });

  if (!existingPackage) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.update.notFound,
    };
  }

  if (orderToUse < 0) {
    const [countResult] = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(examPackageSections)
      .where(eq(examPackageSections.packageId, packageId));

    const currentTotal = Number(countResult?.total || 0);
    orderToUse = currentTotal + 1;
  }

  const isSectionActive = isActive ?? true;

  const newSectionId = await db.transaction(async (tx) => {
    const [section] = await tx
      .insert(examPackageSections)
      .values({
        packageId,
        title,
        groupName,
        description,
        durationMinutes: durationMinutes ?? 0,
        order: orderToUse,
        isActive: isSectionActive,
        versionId,
        createdByUserId: userId,
      })
      .returning({ id: examPackageSections.id });

    await tx
      .update(examPackages)
      .set({
        totalSections: sql`${examPackages.totalSections} + 1`,
        activeSections: isSectionActive ? sql`${examPackages.activeSections} + 1` : undefined,
        durationMinutes: sql`(
          SELECT COALESCE(SUM(${examPackageSections.durationMinutes}), 0)
          FROM ${examPackageSections}
          WHERE ${examPackageSections.packageId} = ${packageId}
          AND ${examPackageSections.isActive} = true
        )`,
        updatedAt: new Date(),
      })
      .where(eq(examPackages.id, packageId));

    return section.id;
  });

  return {
    success: true,
    data: { id: newSectionId },
  };
}
