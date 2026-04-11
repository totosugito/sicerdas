import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const UnassignPackageQuestionsBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  questionIds: Type.Array(Type.String({ format: "uuid" }), { minItems: 1 }),
});

const UnassignPackageQuestionsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const unassignPackageQuestionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/unassign",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Questions"],
      body: UnassignPackageQuestionsBody,
      response: {
        200: UnassignPackageQuestionsResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Body: typeof UnassignPackageQuestionsBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { packageId, questionIds } = request.body;

      await db.transaction(async (tx) => {
        // 1. Get info about questions being unassigned (only those actually in this package)
        const assignments = await tx
          .select({
            id: examQuestions.id,
            isActive: examQuestions.isActive,
            sectionId: examPackageQuestions.sectionId,
          })
          .from(examPackageQuestions)
          .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
          .where(
            and(
              eq(examPackageQuestions.packageId, packageId),
              inArray(examPackageQuestions.questionId, questionIds),
            ),
          );

        if (assignments.length === 0) return;

        const totalUnassigned = assignments.length;
        const activeUnassigned = assignments.filter((a) => a.isActive).length;

        // Group by section to update section-level counts
        const sectionStats: Record<string, { total: number; active: number }> = {};
        for (const a of assignments) {
          if (!sectionStats[a.sectionId]) {
            sectionStats[a.sectionId] = { total: 0, active: 0 };
          }
          sectionStats[a.sectionId].total++;
          if (a.isActive) sectionStats[a.sectionId].active++;
        }

        // 2. Perform deletion
        await tx
          .delete(examPackageQuestions)
          .where(
            and(
              eq(examPackageQuestions.packageId, packageId),
              inArray(examPackageQuestions.questionId, questionIds),
            ),
          );

        // 3. Update Package counts
        await tx
          .update(examPackages)
          .set({
            totalQuestions: sql`${examPackages.totalQuestions} - ${totalUnassigned}`,
            activeQuestions:
              activeUnassigned > 0
                ? sql`${examPackages.activeQuestions} - ${activeUnassigned}`
                : undefined,
            updatedAt: new Date(),
          })
          .where(eq(examPackages.id, packageId));

        // 4. Update Section counts (loop through affected sections)
        for (const [sectionId, stats] of Object.entries(sectionStats)) {
          await tx
            .update(examPackageSections)
            .set({
              totalQuestions: sql`${examPackageSections.totalQuestions} - ${stats.total}`,
              activeQuestions:
                stats.active > 0
                  ? sql`${examPackageSections.activeQuestions} - ${stats.active}`
                  : undefined,
              updatedAt: new Date(),
            })
            .where(eq(examPackageSections.id, sectionId));
        }
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_questions.unassign.success),
      });
    }),
  });
};

export default unassignPackageQuestionsRoute;
