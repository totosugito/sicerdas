import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import { examSessions } from "../../../db/schema/exam/sessions.ts";
import { examSessionAnswers } from "../../../db/schema/exam/session-answers.ts";
import { examQuestions } from "../../../db/schema/exam/questions.ts";
import { examPassages } from "../../../db/schema/exam/passages.ts";
import { examQuestionOptions } from "../../../db/schema/exam/question-options.ts";
import { examQuestionSolutions } from "../../../db/schema/exam/question-solutions.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../db/schema/exam/enums.ts";
import { eq, and, inArray } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";
import { resolveBlockNoteUrls, blocknoteToHtml } from "../../../utils/blocknote-utils.ts";

const Params = Type.Object({
  id: Type.String({ format: "uuid" }),
  questionId: Type.String({ format: "uuid" }),
});

const QuestionDetailsResponse = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    question: Type.Object({
      id: Type.String(),
      type: Type.String(),
      htmlContent: Type.String(),
    }),
    passage: Type.Union([
      Type.Object({
        id: Type.String(),
        title: Type.Union([Type.String(), Type.Null()]),
        htmlContent: Type.String(),
      }),
      Type.Null(),
    ]),
    options: Type.Array(
      Type.Object({
        id: Type.String(),
        htmlContent: Type.String(),
      }),
    ),
    evaluation: Type.Union([
      Type.Object({
        isCorrect: Type.Union([Type.Boolean(), Type.Null()]),
        correctOptionId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
        solutions: Type.Array(
          Type.Object({
            id: Type.String(),
            title: Type.String(),
            htmlContent: Type.String(),
            solutionType: Type.String(),
          }),
        ),
      }),
      Type.Null(),
    ]),
    selectedOptionId: Type.Union([Type.String(), Type.Null()]),
    textAnswer: Type.Union([Type.String(), Type.Null()]),
  }),
});

const questionSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/:id/questions/:questionId",
    method: "GET",
    schema: {
      tags: ["Client Exam Sessions"],
      params: Params,
      response: {
        200: QuestionDetailsResponse,
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
      request: FastifyRequest<{ Params: typeof Params.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { id: sessionId, questionId } = request.params;

      // 1. Fetch the session and verify ownership
      const [session] = await db
        .select()
        .from(examSessions)
        .where(and(eq(examSessions.id, sessionId), eq(examSessions.userId, userId)))
        .limit(1);

      if (!session) {
        return reply.notFound(t(($) => $.exam.sessions.errors.notFound));
      }

      // 2. Verify that this question is part of the user's session answers
      const [answerRecord] = await db
        .select()
        .from(examSessionAnswers)
        .where(
          and(
            eq(examSessionAnswers.sessionId, sessionId),
            eq(examSessionAnswers.questionId, questionId),
          ),
        )
        .limit(1);

      if (!answerRecord) {
        return reply.notFound(t(($) => $.exam.sessions.errors.notFound));
      }

      // 3. Fetch the actual question details
      const [question] = await db
        .select()
        .from(examQuestions)
        .where(eq(examQuestions.id, questionId))
        .limit(1);

      if (!question) {
        return reply.notFound(t(($) => $.exam.sessions.errors.notFound));
      }

      // 4. Fetch the passage if it exists
      let passageData = null;
      if (question.passageId) {
        const [passage] = await db
          .select()
          .from(examPassages)
          .where(eq(examPassages.id, question.passageId))
          .limit(1);
        if (passage) {
          const resolvedPassage = resolveBlockNoteUrls(passage.content as any);
          passageData = {
            id: passage.id,
            title: passage.title,
            htmlContent: await blocknoteToHtml(resolvedPassage),
          };
        }
      }

      // 5. Fetch options and order them based on the shuffled order saved in the session
      let orderedOptionsData: any[] = [];
      if (
        answerRecord.shuffledOptionsOrder &&
        Array.isArray(answerRecord.shuffledOptionsOrder) &&
        answerRecord.shuffledOptionsOrder.length > 0
      ) {
        const optionsRaw = await db
          .select()
          .from(examQuestionOptions)
          .where(inArray(examQuestionOptions.id, answerRecord.shuffledOptionsOrder as string[]));

        // Reorder
        const rawOrderedOptions = answerRecord.shuffledOptionsOrder
          .map((optId) => {
            return optionsRaw.find((o) => o.id === optId) || null;
          })
          .filter(Boolean);

        orderedOptionsData = await Promise.all(
          rawOrderedOptions.map(async (opt: any) => {
            const resolvedOptContent = resolveBlockNoteUrls(opt.content as any);
            return {
              id: opt.id,
              htmlContent: await blocknoteToHtml(resolvedOptContent),
            };
          }),
        );
      } else {
        // Fallback to default ordering if not shuffled
        const optionsRaw = await db
          .select()
          .from(examQuestionOptions)
          .where(eq(examQuestionOptions.questionId, questionId))
          .orderBy(examQuestionOptions.order);

        orderedOptionsData = await Promise.all(
          optionsRaw.map(async (opt) => {
            const resolvedOptContent = resolveBlockNoteUrls(opt.content as any);
            return {
              id: opt.id,
              htmlContent: await blocknoteToHtml(resolvedOptContent),
            };
          }),
        );
      }

      // 6. Evaluate correctness and solutions logic
      let evaluation = null;
      const isAnswered = answerRecord.selectedOptionId !== null || answerRecord.textAnswer !== null;
      const shouldEvaluate =
        session.status === EnumExamSessionStatus.COMPLETED ||
        (session.mode === EnumExamSessionMode.STUDY && isAnswered);

      if (shouldEvaluate) {
        const solutionsRaw = await db
          .select()
          .from(examQuestionSolutions)
          .where(eq(examQuestionSolutions.questionId, questionId))
          .orderBy(examQuestionSolutions.order);

        const [correctOption] = await db
          .select({ id: examQuestionOptions.id })
          .from(examQuestionOptions)
          .where(
            and(
              eq(examQuestionOptions.questionId, questionId),
              eq(examQuestionOptions.isCorrect, true),
            ),
          )
          .limit(1);

        evaluation = {
          isCorrect: answerRecord.isCorrect ?? null,
          correctOptionId: correctOption?.id ?? null,
          solutions: await Promise.all(
            solutionsRaw.map(async (sol) => {
              const resolvedSolContent = resolveBlockNoteUrls(sol.content as any);
              return {
                id: sol.id,
                title: sol.title,
                solutionType: sol.solutionType,
                htmlContent: await blocknoteToHtml(resolvedSolContent),
              };
            }),
          ),
        };
      }

      const resolvedQuestionContent = resolveBlockNoteUrls(question.content as any);

      return reply.status(200).send({
        success: true,
        data: {
          question: {
            id: question.id,
            type: question.type,
            htmlContent: await blocknoteToHtml(resolvedQuestionContent),
          },
          passage: passageData,
          options: orderedOptionsData,
          evaluation,
          selectedOptionId: answerRecord.selectedOptionId,
          textAnswer: answerRecord.textAnswer,
        },
      });
    }),
  });
};

export default questionSessionRoute;
