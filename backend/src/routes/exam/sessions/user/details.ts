import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { examSessionAnswers } from "../../../../db/schema/exam/session-answers.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { eq, and, inArray } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const SessionDetailsParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const SessionDetailsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    session: Type.Object({
      id: Type.String({ format: "uuid" }),
      startTime: Type.String({ format: "date-time" }),
      status: Type.String(),
      mode: Type.String(),
      elapsedSeconds: Type.Number(),
      isTimerActive: Type.Boolean(),
      package: Type.Object({
        title: Type.String(),
      }),
      section: Type.Object({
        title: Type.String(),
        durationMinutes: Type.Number(),
      }),
    }),
    answers: Type.Array(
      Type.Object({
        questionId: Type.String({ format: "uuid" }),
        questionOrder: Type.Number(),
        isDoubtful: Type.Boolean(),
        selectedOptionId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
        textAnswer: Type.Optional(
          Type.Union([Type.Array(Type.Record(Type.String(), Type.Unknown())), Type.Null()]),
        ),
        question: Type.Object({
          content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
          type: Type.String(),
          options: Type.Array(
            Type.Object({
              id: Type.String({ format: "uuid" }),
              content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
            }),
          ),
        }),
      }),
    ),
  }),
});

const sessionDetailsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/details/:id",
    method: "GET",
    schema: {
      tags: ["Client Exam Sessions"],
      params: SessionDetailsParams,
      response: {
        200: SessionDetailsResponse,
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
      request: FastifyRequest<{ Params: typeof SessionDetailsParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { id } = request.params;

      // 1. Get Session, Package, and Section Info
      const [session] = await db
        .select({
          id: examSessions.id,
          startTime: examSessions.startTime,
          status: examSessions.status,
          mode: examSessions.mode,
          elapsedSeconds: examSessions.elapsedSeconds,
          isTimerActive: examSessions.isTimerActive,
          package: {
            title: examPackages.title,
          },
          section: {
            title: examPackageSections.title,
            durationMinutes: examPackageSections.durationMinutes,
          },
        })
        .from(examSessions)
        .innerJoin(examPackages, eq(examSessions.packageId, examPackages.id))
        .innerJoin(examPackageSections, eq(examSessions.sectionId, examPackageSections.id))
        .where(and(eq(examSessions.id, id), eq(examSessions.userId, userId)))
        .limit(1);

      if (!session) {
        return reply.notFound(t(($) => $.exam.sessions.details.notFound));
      }

      // 2. Get Answers, Questions, and Options
      const answersRaw = await db
        .select({
          questionId: examSessionAnswers.questionId,
          questionOrder: examSessionAnswers.questionOrder,
          isDoubtful: examSessionAnswers.isDoubtful,
          selectedOptionId: examSessionAnswers.selectedOptionId,
          textAnswer: examSessionAnswers.textAnswer,
          shuffledOptionsOrder: examSessionAnswers.shuffledOptionsOrder,
          question: {
            content: examQuestions.content,
            type: examQuestions.type,
          },
        })
        .from(examSessionAnswers)
        .innerJoin(examQuestions, eq(examSessionAnswers.questionId, examQuestions.id))
        .where(eq(examSessionAnswers.sessionId, id))
        .orderBy(examSessionAnswers.questionOrder);

      // 3. Fetch all options for these questions
      const questionIds = answersRaw.map((a) => a.questionId);
      const allOptions = await db
        .select({
          id: examQuestionOptions.id,
          questionId: examQuestionOptions.questionId,
          content: examQuestionOptions.content,
        })
        .from(examQuestionOptions)
        .where(inArray(examQuestionOptions.questionId, questionIds));

      // 4. Map and sort options based on shuffledOptionsOrder
      const resultAnswers = answersRaw.map((ans) => {
        const questionOptions = allOptions.filter((o) => o.questionId === ans.questionId);

        let sortedOptions = questionOptions;
        if (ans.shuffledOptionsOrder && ans.shuffledOptionsOrder.length > 0) {
          // Sort based on the stored randomized order
          sortedOptions = ans.shuffledOptionsOrder
            .map((id) => questionOptions.find((o) => o.id === id))
            .filter((o): o is (typeof questionOptions)[0] => !!o);
        }

        return {
          questionId: ans.questionId,
          questionOrder: ans.questionOrder,
          isDoubtful: ans.isDoubtful,
          selectedOptionId: ans.selectedOptionId,
          textAnswer: ans.textAnswer,
          question: {
            ...ans.question,
            options: sortedOptions.map((o) => ({
              id: o.id,
              content: o.content,
            })),
          },
        };
      });

      return reply.status(200).send({
        success: true,
        message: "OK",
        data: {
          session: {
            ...session,
            startTime: session.startTime.toISOString(),
          },
          answers: resultAnswers as any,
        },
      });
    }),
  });
};

export default sessionDetailsRoute;
