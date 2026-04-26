import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examSessionAnswers } from "../../../../db/schema/exam/session-answers.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../../db/schema/exam/enums.ts";
import { eq, and } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const SaveAnswerBody = Type.Object({
  sessionId: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
  selectedOptionId: Type.Optional(Type.Union([Type.String({ format: "uuid" }), Type.Null()])),
  textAnswer: Type.Optional(
    Type.Union([Type.Array(Type.Record(Type.String(), Type.Unknown())), Type.Null()]),
  ),
  isDoubtful: Type.Optional(Type.Boolean()),
  elapsedSeconds: Type.Number({ minimum: 0 }), // Sync from frontend
});

const SaveAnswerResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const saveAnswerRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/save-answer",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      body: SaveAnswerBody,
      response: {
        200: SaveAnswerResponse,
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
      request: FastifyRequest<{ Body: typeof SaveAnswerBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { sessionId, questionId, selectedOptionId, textAnswer, isDoubtful, elapsedSeconds } =
        request.body;

      // 1. Verify session ownership, status, and mode
      const [session] = await db
        .select({
          id: examSessions.id,
          status: examSessions.status,
          mode: examSessions.mode,
        })
        .from(examSessions)
        .where(and(eq(examSessions.id, sessionId), eq(examSessions.userId, userId)))
        .limit(1);

      if (!session) {
        return reply.notFound(t(($) => $.exam.sessions.saveAnswer.notFound));
      }

      if (session.status !== EnumExamSessionStatus.IN_PROGRESS) {
        return reply.forbidden(t(($) => $.exam.sessions.saveAnswer.finished));
      }

      // 2. Sync elapsedSeconds to session
      await db
        .update(examSessions)
        .set({ elapsedSeconds, updatedAt: new Date() })
        .where(eq(examSessions.id, sessionId));

      // 3. Mode-specific restrictions
      if (session.mode === EnumExamSessionMode.STUDY) {
        // In Study mode, if an answer is already selected, it's locked (One-shot)
        const [existingAnswer] = await db
          .select({ selectedOptionId: examSessionAnswers.selectedOptionId })
          .from(examSessionAnswers)
          .where(
            and(
              eq(examSessionAnswers.sessionId, sessionId),
              eq(examSessionAnswers.questionId, questionId),
            ),
          )
          .limit(1);

        if (existingAnswer?.selectedOptionId) {
          return reply.forbidden(t(($) => $.exam.sessions.saveAnswer.studyLocked));
        }
      }

      // 4. Update the answer
      const updateData: any = { updatedAt: new Date() };
      if (selectedOptionId !== undefined) updateData.selectedOptionId = selectedOptionId;
      if (textAnswer !== undefined) updateData.textAnswer = textAnswer;
      if (isDoubtful !== undefined) updateData.isDoubtful = isDoubtful;

      await db
        .update(examSessionAnswers)
        .set(updateData)
        .where(
          and(
            eq(examSessionAnswers.sessionId, sessionId),
            eq(examSessionAnswers.questionId, questionId),
          ),
        );

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.sessions.saveAnswer.success),
        data: { sessionId, questionId },
      });
    }),
  });
};

export default saveAnswerRoute;
