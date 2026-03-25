import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { and, eq, inArray } from "drizzle-orm";
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

      await db
        .delete(examPackageQuestions)
        .where(
          and(
            eq(examPackageQuestions.packageId, packageId),
            inArray(examPackageQuestions.questionId, questionIds),
          ),
        );

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_questions.unassign.success),
      });
    }),
  });
};

export default unassignPackageQuestionsRoute;
