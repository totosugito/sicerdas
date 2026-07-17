import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { and, eq, inArray } from "drizzle-orm";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { syncSection, syncPackage } from "../../../../services/exam/index.ts";

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
    handler: async function handler(
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

        // 2. Perform deletion
        await tx
          .delete(examPackageQuestions)
          .where(
            and(
              eq(examPackageQuestions.packageId, packageId),
              inArray(examPackageQuestions.questionId, questionIds),
            ),
          );

        // 3. Fully sync Package and Section counters via SQL Ground Truth
        await syncPackage(packageId, tx);

        const uniqueSectionIds = [...new Set(assignments.map((a) => a.sectionId))];
        for (const sectionId of uniqueSectionIds) {
          await syncSection(sectionId, tx);
        }
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_questions.unassign.success),
      });
    },
  });
};

export default unassignPackageQuestionsRoute;
