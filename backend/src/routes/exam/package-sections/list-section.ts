import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import { examPackageSections } from "../../../db/schema/exam/package-sections.ts";
import { examPackages } from "../../../db/schema/exam/packages.ts";
import { and, eq } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const SectionListQuery = Type.Object({
  packageId: Type.String({ format: "uuid" }),
});

const SectionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  groupName: Type.Union([Type.String(), Type.Null()]),
  durationMinutes: Type.Union([Type.Number(), Type.Null()]),
  totalQuestions: Type.Number(),
  activeQuestions: Type.Number(),
  order: Type.Number(),
});

const ListSectionsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Array(SectionResponseItem),
});

const listSectionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Exam Package Sections"],
      summary: "List sections for an exam package (Student)",
      body: SectionListQuery,
      response: {
        200: ListSectionsResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Body: typeof SectionListQuery.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { packageId } = request.body;

      // Verify package existence and activity
      const pkg = await db.query.examPackages.findFirst({
        where: and(eq(examPackages.id, packageId), eq(examPackages.isActive, true)),
        columns: { id: true },
      });

      if (!pkg) {
        return reply.notFound(t(($) => $.exam.packages.detail.notFound));
      }

      // Fetch active sections
      const sections = await db
        .select({
          id: examPackageSections.id,
          title: examPackageSections.title,
          groupName: examPackageSections.groupName,
          durationMinutes: examPackageSections.durationMinutes,
          totalQuestions: examPackageSections.totalQuestions,
          activeQuestions: examPackageSections.activeQuestions,
          order: examPackageSections.order,
        })
        .from(examPackageSections)
        .where(
          and(eq(examPackageSections.packageId, packageId), eq(examPackageSections.isActive, true)),
        )
        .orderBy(examPackageSections.order);

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_sections.list.success),
        data: sections,
      });
    }),
  });
};

export default listSectionsRoute;
