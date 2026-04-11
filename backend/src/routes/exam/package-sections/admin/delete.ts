import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { eq, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const DeleteSectionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const DeleteSectionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const deleteSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Package Sections"],
      params: DeleteSectionParams,
      response: {
        200: DeleteSectionResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Params: typeof DeleteSectionParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      const existing = await db.query.examPackageSections.findFirst({
        where: eq(examPackageSections.id, id),
      });

      if (!existing) {
        return reply.notFound(t(($) => $.exam.package_sections.delete.notFound));
      }

      // Check if section is in use by any questions
      const inUseCheck = await db.query.examPackageQuestions.findFirst({
        where: eq(examPackageQuestions.sectionId, id),
      });

      if (inUseCheck) {
        return reply.badRequest(t(($) => $.exam.package_sections.delete.inUse));
      }

      await db.transaction(async (tx) => {
        await tx.delete(examPackageSections).where(eq(examPackageSections.id, id));

        // Update counts in the parent package
        await tx
          .update(examPackages)
          .set({
            totalSections: sql`${examPackages.totalSections} - 1`,
            activeSections: existing.isActive ? sql`${examPackages.activeSections} - 1` : undefined,
            updatedAt: new Date(),
          })
          .where(eq(examPackages.id, existing.packageId));
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_sections.delete.success),
      });
    }),
  });
};

export default deleteSectionRoute;
