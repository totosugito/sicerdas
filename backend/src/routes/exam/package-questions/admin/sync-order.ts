import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { and, eq } from "drizzle-orm";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const SyncPackageQuestionsOrderBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.String({ format: "uuid" }),
  questionIds: Type.Array(Type.String({ format: "uuid" })),
});

const SyncPackageQuestionsOrderResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const syncPackageQuestionsOrderRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/sync-order",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Questions"],
      body: SyncPackageQuestionsOrderBody,
      response: {
        200: SyncPackageQuestionsOrderResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Body: typeof SyncPackageQuestionsOrderBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { packageId, sectionId, questionIds } = request.body;

      await db.transaction(async (tx) => {
        // 1. Delete all current questions in this section
        await tx
          .delete(examPackageQuestions)
          .where(
            and(
              eq(examPackageQuestions.packageId, packageId),
              eq(examPackageQuestions.sectionId, sectionId),
            ),
          );

        // 2. Insert with the new order if there are questions
        if (questionIds.length > 0) {
          const values = questionIds.map((questionId, index) => ({
            packageId,
            sectionId,
            questionId,
            order: index + 1,
          }));

          await tx.insert(examPackageQuestions).values(values);
        }
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_questions.assign.success),
      });
    }),
  });
};

export default syncPackageQuestionsOrderRoute;
