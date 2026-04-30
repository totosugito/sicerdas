import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { inArray } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { ScoringService } from "../../../../services/exam/scoring-service.ts";

const DeleteMultipleQuestionOptionsBody = Type.Object({
  ids: Type.Array(Type.String({ format: "uuid" }), { minItems: 1 }),
});

const DeleteMultipleQuestionOptionsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const deleteMultipleQuestionOptionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/deletes",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Options"],
      body: DeleteMultipleQuestionOptionsBody,
      response: {
        200: DeleteMultipleQuestionOptionsResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Body: typeof DeleteMultipleQuestionOptionsBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { ids } = request.body;

      // Identify affected questions before delete
      const affectedQuestions = await db
        .select({ questionId: examQuestionOptions.questionId })
        .from(examQuestionOptions)
        .where(inArray(examQuestionOptions.id, ids));

      const uniqueQuestionIds = [...new Set(affectedQuestions.map((q) => q.questionId))];

      // Perform Hard Delete for all provided IDs
      await db.delete(examQuestionOptions).where(inArray(examQuestionOptions.id, ids));

      // Sync each affected question's maxScore
      for (const qId of uniqueQuestionIds) {
        await ScoringService.syncQuestionMaxScore(qId);
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.question_options.delete.successMultiple),
      });
    }),
  });
};

export default deleteMultipleQuestionOptionsRoute;
