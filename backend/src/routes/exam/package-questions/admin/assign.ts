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

const AssignPackageQuestionsBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.String({ format: "uuid" }),
  questionIds: Type.Array(Type.String({ format: "uuid" }), { minItems: 1 }),
});

const AssignPackageQuestionsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Optional(
    Type.Object({
      totalAssigned: Type.Number(),
      totalSkipped: Type.Number(),
    }),
  ),
});

const assignPackageQuestionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/assign",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Questions"],
      body: AssignPackageQuestionsBody,
      response: {
        200: AssignPackageQuestionsResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Body: typeof AssignPackageQuestionsBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { packageId, sectionId, questionIds } = request.body;

      let totalAssigned = 0;
      let totalSkipped = 0;

      await db.transaction(async (tx) => {
        // 1. Check which questions are already assigned to this package
        const existingAssignments = await tx
          .select({ questionId: examPackageQuestions.questionId })
          .from(examPackageQuestions)
          .where(
            and(
              eq(examPackageQuestions.packageId, packageId),
              inArray(examPackageQuestions.questionId, questionIds),
            ),
          );

        const existingIds = new Set(existingAssignments.map((a) => a.questionId));
        const newQuestionIds = questionIds.filter((id) => !existingIds.has(id));

        totalSkipped = existingIds.size;
        totalAssigned = newQuestionIds.length;

        if (newQuestionIds.length === 0) {
          return; // All requested questions are already assigned
        }

        // 2. Get the current maximum order in this section
        const currentMax = await tx
          .select({ maxOrder: sql<number>`MAX(${examPackageQuestions.order})` })
          .from(examPackageQuestions)
          .where(
            and(
              eq(examPackageQuestions.packageId, packageId),
              eq(examPackageQuestions.sectionId, sectionId),
            ),
          );

        let nextOrder = (currentMax[0]?.maxOrder ?? 0) + 1;

        // 3. Insert only new assignments
        const values = newQuestionIds.map((questionId) => ({
          packageId,
          sectionId,
          questionId,
          order: nextOrder++,
        }));

        await tx.insert(examPackageQuestions).values(values);

        // 4. Update counts in the package AND section
        const questionsInfo = await tx
          .select({ isActive: examQuestions.isActive })
          .from(examQuestions)
          .where(inArray(examQuestions.id, newQuestionIds));

        const activeCount = questionsInfo.filter((q) => q.isActive).length;

        // Update Package
        await tx
          .update(examPackages)
          .set({
            totalQuestions: sql`${examPackages.totalQuestions} + ${newQuestionIds.length}`,
            activeQuestions:
              activeCount > 0 ? sql`${examPackages.activeQuestions} + ${activeCount}` : undefined,
            updatedAt: new Date(),
          })
          .where(eq(examPackages.id, packageId));

        // Update Section
        await tx
          .update(examPackageSections)
          .set({
            totalQuestions: sql`${examPackageSections.totalQuestions} + ${newQuestionIds.length}`,
            activeQuestions:
              activeCount > 0
                ? sql`${examPackageSections.activeQuestions} + ${activeCount}`
                : undefined,
            updatedAt: new Date(),
          })
          .where(eq(examPackageSections.id, sectionId));
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_questions.assign.success),
        data: {
          totalAssigned,
          totalSkipped,
        },
      });
    }),
  });
};

export default assignPackageQuestionsRoute;
