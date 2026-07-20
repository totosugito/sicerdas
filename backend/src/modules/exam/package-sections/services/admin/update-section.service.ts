import { db } from "../../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../../db/schema/exam/package-sections.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { UpdateSectionParams } from "../../package-sections.schema.ts";

export async function updateSectionService(
  id: string,
  params: UpdateSectionParams,
): Promise<ServiceResponse> {
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

  const existing = await db.query.examPackageSections.findFirst({
    where: eq(examPackageSections.id, id),
  });

  if (!existing) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.package_sections.update.notFound,
    };
  }

  if (packageId) {
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
  }

  await db.transaction(async (tx) => {
    await tx
      .update(examPackageSections)
      .set({
        packageId,
        title,
        groupName,
        description,
        durationMinutes,
        order,
        isActive,
        versionId,
        updatedAt: new Date(),
      })
      .where(eq(examPackageSections.id, id));

    const targetPackageId = packageId ?? existing.packageId;
    const isMovingPackage = packageId !== undefined && packageId !== existing.packageId;
    const isSectionActive = isActive ?? existing.isActive;

    if (isMovingPackage) {
      await tx
        .update(examPackages)
        .set({
          totalSections: sql`${examPackages.totalSections} + 1`,
          activeSections: isSectionActive ? sql`${examPackages.activeSections} + 1` : undefined,
          durationMinutes: sql`(
            SELECT COALESCE(SUM(${examPackageSections.durationMinutes}), 0)
            FROM ${examPackageSections}
            WHERE ${examPackageSections.packageId} = ${targetPackageId}
            AND ${examPackageSections.isActive} = true
          )`,
          updatedAt: new Date(),
        })
        .where(eq(examPackages.id, targetPackageId));

      await tx
        .update(examPackages)
        .set({
          totalSections: sql`${examPackages.totalSections} - 1`,
          activeSections: existing.isActive
            ? sql`${examPackages.activeSections} - 1`
            : undefined,
          durationMinutes: sql`(
            SELECT COALESCE(SUM(${examPackageSections.durationMinutes}), 0)
            FROM ${examPackageSections}
            WHERE ${examPackageSections.packageId} = ${existing.packageId}
            AND ${examPackageSections.isActive} = true
          )`,
          updatedAt: new Date(),
        })
        .where(eq(examPackages.id, existing.packageId));
    } else {
      const activeChanged = isActive !== undefined && isActive !== existing.isActive;
      const durationChanged =
        durationMinutes !== undefined && durationMinutes !== existing.durationMinutes;

      if (activeChanged || durationChanged) {
        await tx
          .update(examPackages)
          .set({
            activeSections: activeChanged
              ? isActive
                ? sql`${examPackages.activeSections} + 1`
                : sql`${examPackages.activeSections} - 1`
              : undefined,
            durationMinutes: sql`(
              SELECT COALESCE(SUM(${examPackageSections.durationMinutes}), 0)
              FROM ${examPackageSections}
              WHERE ${examPackageSections.packageId} = ${targetPackageId}
              AND ${examPackageSections.isActive} = true
            )`,
            updatedAt: new Date(),
          })
          .where(eq(examPackages.id, targetPackageId));
      }
    }
  });

  return { success: true };
}
