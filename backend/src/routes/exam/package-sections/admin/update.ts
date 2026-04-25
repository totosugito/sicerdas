import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { eq, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const UpdateSectionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const UpdateSectionBody = Type.Object({
  packageId: Type.Optional(Type.String({ format: "uuid" })),
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  groupName: Type.Optional(Type.String({ maxLength: 255 })),
  description: Type.Optional(Type.String()),
  durationMinutes: Type.Optional(Type.Number({ minimum: 0 })),
  order: Type.Optional(Type.Number()),
  isActive: Type.Optional(Type.Boolean()),
  versionId: Type.Optional(Type.Number()),
});

const UpdateSectionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const updateSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Package Sections"],
      params: UpdateSectionParams,
      body: UpdateSectionBody,
      response: {
        200: UpdateSectionResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{
        Params: typeof UpdateSectionParams.static;
        Body: typeof UpdateSectionBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;
      const {
        packageId,
        title,
        groupName,
        description,
        durationMinutes,
        order,
        isActive,
        versionId,
      } = request.body;

      const existing = await db.query.examPackageSections.findFirst({
        where: eq(examPackageSections.id, id),
      });

      if (!existing) {
        return reply.notFound(t(($) => $.exam.package_sections.update.notFound));
      }

      if (packageId) {
        const existingPackage = await db.query.examPackages.findFirst({
          where: eq(examPackages.id, packageId),
        });

        if (!existingPackage) {
          return reply.notFound(t(($) => $.exam.packages.update.notFound));
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

        // 1. Handle Target Package Update
        if (isMovingPackage) {
          // Moved to this package: increment counts and recalculate duration
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

          // Removed from old package: decrement counts and recalculate duration
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
          // Same package: handle isActive and durationMinutes changes
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

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_sections.update.success),
      });
    }),
  });
};

export default updateSectionRoute;
