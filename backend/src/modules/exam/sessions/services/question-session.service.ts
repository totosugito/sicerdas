import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examSessionAnswers } from "../../../../db/schema/exam/session-answers.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../../db/schema/exam/enums.ts";
import { eq, and, inArray } from "drizzle-orm";
import { resolveBlockNoteUrls, blocknoteToHtml } from "../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { QuestionSessionData } from "../sessions.schema.ts";

export interface QuestionSessionResult extends ServiceResponse {
  data?: QuestionSessionData;
}

export async function questionSessionService(
  userId: string,
  sessionId: string,
  questionId: string,
): Promise<QuestionSessionResult> {
  // 1. Fetch the session and verify ownership
  const [session] = await db
    .select()
    .from(examSessions)
    .where(and(eq(examSessions.id, sessionId), eq(examSessions.userId, userId)))
    .limit(1);

  if (!session) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.sessions.errors.notFound };
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
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.sessions.errors.notFound };
  }

  // 3. Fetch the actual question details
  const [question] = await db
    .select()
    .from(examQuestions)
    .where(eq(examQuestions.id, questionId))
    .limit(1);

  if (!question) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.sessions.errors.notFound };
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

    const rawOrderedOptions = answerRecord.shuffledOptionsOrder
      .map((optId) => optionsRaw.find((o) => o.id === optId) || null)
      .filter(Boolean);

    // Reorder
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

  return {
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
  };
}
