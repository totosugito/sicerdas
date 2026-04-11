import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { educationCategories } from "../../../../db/schema/education/categories.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { eq, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { EnumContentType } from "../../../../db/schema/enum/enum-app.ts";
import { getPackageThumbnailUrl } from "../../../../utils/exam-utils.ts";

const DetailPackageParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const PackageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  categoryId: Type.String({ format: "uuid" }),
  title: Type.String(),
  examType: Type.String(),
  durationMinutes: Type.Number(),
  description: Type.Union([Type.String(), Type.Null()]),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  educationGradeId: Type.Union([Type.Number(), Type.Null()]),
  categoryName: Type.Union([Type.String(), Type.Null()]),
  educationGradeName: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  versionId: Type.Union([Type.Number(), Type.Null()]),
  isNew: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const DetailPackageResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: PackageResponseItem,
});

const detailPackageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Exam Packages"],
      params: DetailPackageParams,
      response: {
        200: DetailPackageResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Params: typeof DetailPackageParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      const latestVersionId = (app as any).versionCache.get(EnumContentType.EXAM);

      const [result] = await db
        .select({
          package: examPackages,
          categoryName: educationCategories.name,
          educationGradeName: educationGrades.name,
          isNew: latestVersionId
            ? sql<boolean>`${examPackages.versionId} = ${latestVersionId}`.as("isNew")
            : sql<boolean>`false`.as("isNew"),
        })
        .from(examPackages)
        .leftJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
        .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
        .where(eq(examPackages.id, id))
        .limit(1);

      if (!result) {
        return reply.notFound(t(($) => $.exam.packages.detail.notFound));
      }

      const pkg = result.package;

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.packages.detail.success),
        data: {
          ...pkg,
          thumbnail: getPackageThumbnailUrl(pkg.thumbnail),
          categoryName: result.categoryName,
          educationGradeName: result.educationGradeName,
          isNew: !!result.isNew,
          versionId: pkg.versionId,
          createdAt: pkg.createdAt.toISOString(),
          updatedAt: pkg.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default detailPackageRoute;
