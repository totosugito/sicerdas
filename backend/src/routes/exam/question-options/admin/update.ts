import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const UpdateQuestionOptionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const UpdateQuestionOptionBody = Type.Object({
  questionId: Type.Optional(Type.String({ format: "uuid" })),
  content: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  isCorrect: Type.Optional(Type.Boolean()),
  score: Type.Optional(Type.Integer()),
  order: Type.Optional(Type.Number()),
});

const QuestionOptionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isCorrect: Type.Boolean(),
  score: Type.Integer(),
  order: Type.Number(),
});

const UpdateQuestionOptionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: QuestionOptionResponseItem,
});

const updateQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Question Options"],
      params: UpdateQuestionOptionParams,
      body: UpdateQuestionOptionBody,
      response: {
        200: UpdateQuestionOptionResponse,
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
      request: FastifyRequest<{
        Params: typeof UpdateQuestionOptionParams.static;
        Body: typeof UpdateQuestionOptionBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;
      const { questionId, content, isCorrect, score, order } = request.body;

      // Ensure option exists
      const existingOption = await db.query.examQuestionOptions.findFirst({
        where: eq(examQuestionOptions.id, id),
      });

      if (!existingOption) {
        return reply.notFound(t(($) => $.exam.question_options.update.notFound));
      }

      // Verify new question exists if provided
      if (questionId !== undefined) {
        const existingQuestion = await db.query.examQuestions.findFirst({
          where: eq(examQuestions.id, questionId),
        });
        if (!existingQuestion) {
          return reply.badRequest(t(($) => $.exam.question_options.update.invalidQuestion));
        }
      }

      // Build dynamic update payload
      const updatePayload: any = {};

      if (questionId !== undefined) updatePayload.questionId = questionId;
      if (content !== undefined) updatePayload.content = content;
      if (isCorrect !== undefined) updatePayload.isCorrect = isCorrect;
      if (score !== undefined) updatePayload.score = score;
      if (order !== undefined) updatePayload.order = order;

      const [updatedOption] = await db
        .update(examQuestionOptions)
        .set(updatePayload)
        .where(eq(examQuestionOptions.id, id))
        .returning();

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.question_options.update.success),
        data: updatedOption,
      });
    }),
  });
};

export default updateQuestionOptionRoute;
