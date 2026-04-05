import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { EnumContentType } from "../../../../db/schema/enum/enum-app.ts";
import { sql } from "drizzle-orm";

const DetailSectionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const SectionDetailItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  packageId: Type.String({ format: "uuid" }),
  packageName: Type.String(),
  title: Type.String(),
  groupName: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]),
  durationMinutes: Type.Number(),
  order: Type.Number(),
  isActive: Type.Boolean(),
  versionId: Type.Union([Type.Number(), Type.Null()]),
  isNew: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const DetailSectionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: SectionDetailItem,
});

const detailSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Exam Package Sections"],
      params: DetailSectionParams,
      response: {
        200: DetailSectionResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{
        Params: typeof DetailSectionParams.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;
      const latestVersionId = (app as any).versionCache?.get(EnumContentType.EXAM);

      // 1. Get Section & Package Information
      const [sectionResult] = await db
        .select({
          section: examPackageSections,
          packageName: examPackages.title,
          isNew: latestVersionId
            ? sql<boolean>`${examPackageSections.versionId} = ${latestVersionId}`.as("isNew")
            : sql<boolean>`false`.as("isNew"),
        })
        .from(examPackageSections)
        .innerJoin(examPackages, eq(examPackageSections.packageId, examPackages.id))
        .where(eq(examPackageSections.id, id))
        .limit(1);

      if (!sectionResult) {
        return reply.notFound(t(($) => $.exam.package_sections.detail.notFound));
      }

      const section = sectionResult.section;

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_sections.detail.success),
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
          isNew: !!sectionResult.isNew,
          createdAt: section.createdAt.toISOString(),
          updatedAt: section.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default detailSectionRoute;
