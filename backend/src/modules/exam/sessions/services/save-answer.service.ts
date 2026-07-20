import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examSessionAnswers } from "../../../../db/schema/exam/session-answers.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../../db/schema/exam/enums.ts";
import { eq, and } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { SaveAnswerBodyType, SaveAnswerData } from "../sessions.schema.ts";

export interface SaveAnswerResult extends ServiceResponse {
  data?: SaveAnswerData;
}

export async function saveAnswerService(
  userId: string,
  params: SaveAnswerBodyType,
): Promise<SaveAnswerResult> {
  const { sessionId, questionId, selectedOptionId, textAnswer, isDoubtful, elapsedSeconds } = params;

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
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.sessions.saveAnswer.notFound };
  }

  if (session.status !== EnumExamSessionStatus.IN_PROGRESS) {
    return { success: false, statusCode: 403, errorKey: ($) => $.exam.sessions.saveAnswer.finished };
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
      return { success: false, statusCode: 403, errorKey: ($) => $.exam.sessions.saveAnswer.studyLocked };
    }
  }

  // 4. Update the answer
  const updateData: any = { updatedAt: new Date() };
  if (selectedOptionId !== undefined) updateData.selectedOptionId = selectedOptionId;
  if (textAnswer !== undefined) updateData.textAnswer = textAnswer;
  if (isDoubtful !== undefined) updateData.isDoubtful = isDoubtful;

  // 5. Automatic evaluation for Study Mode (One-shot)
  if (session.mode === EnumExamSessionMode.STUDY && selectedOptionId) {
    const [option] = await db
      .select({ isCorrect: examQuestionOptions.isCorrect })
      .from(examQuestionOptions)
      .where(eq(examQuestionOptions.id, selectedOptionId))
      .limit(1);

    if (option) {
      updateData.isCorrect = option.isCorrect;
    }
  }

  await db
    .update(examSessionAnswers)
    .set(updateData)
    .where(
      and(
        eq(examSessionAnswers.sessionId, sessionId),
        eq(examSessionAnswers.questionId, questionId),
      ),
    );

  return {
    success: true,
    data: { sessionId, questionId },
  };
}
