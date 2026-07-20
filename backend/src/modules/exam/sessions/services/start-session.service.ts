import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { examSessionAnswers } from "../../../../db/schema/exam/session-answers.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { EnumExamSessionStatus, EnumExamSessionMode, EnumExamType } from "../../../../db/schema/exam/enums.ts";
import { eq, and, inArray, or } from "drizzle-orm";
import { shuffleArray } from "../../../../utils/my-utils.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { StartSessionData, StartSessionBodyType } from "../sessions.schema.ts";

export interface StartSessionResult extends ServiceResponse {
  data?: StartSessionData;
}

export async function startSessionService(
  userId: string,
  params: StartSessionBodyType,
): Promise<StartSessionResult> {
  const { packageId, sectionId, mode } = params;

  // 1. Check if package and section exist and are active
  const [section] = await db
    .select({ id: examPackageSections.id })
    .from(examPackageSections)
    .innerJoin(examPackages, eq(examPackageSections.packageId, examPackages.id))
    .where(
      and(
        eq(examPackageSections.id, sectionId),
        eq(examPackageSections.packageId, packageId),
        eq(examPackageSections.isActive, true),
        eq(examPackages.isActive, true),
        or(
          eq(examPackages.examType, EnumExamType.OFFICIAL),
          eq(examPackages.createdByUserId, userId),
        ),
      ),
    )
    .limit(1);

  if (!section) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.packages.update.notFound };
  }

  // 2. Check for existing IN_PROGRESS session (Resume Capability)
  const [existingSession] = await db
    .select({ id: examSessions.id })
    .from(examSessions)
    .where(
      and(
        eq(examSessions.userId, userId),
        eq(examSessions.packageId, packageId),
        eq(examSessions.sectionId, sectionId),
        eq(examSessions.mode, mode),
        eq(examSessions.status, EnumExamSessionStatus.IN_PROGRESS),
      ),
    )
    .limit(1);

  if (existingSession) {
    return {
      success: true,
      data: { sessionId: existingSession.id, isResumed: true },
    };
  }

  // 3. Create a new session
  const [newSession] = await db
    .insert(examSessions)
    .values({
      userId,
      packageId,
      sectionId,
      mode,
      isTimerActive: mode === EnumExamSessionMode.TRYOUT,
      status: EnumExamSessionStatus.IN_PROGRESS,
    })
    .returning({ id: examSessions.id });

  // 4. Fetch questions for this section
  const questionsRaw = await db
    .select({
      questionId: examPackageQuestions.questionId,
      variableFormulas: examQuestions.variableFormulas,
    })
    .from(examPackageQuestions)
    .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
    .where(eq(examPackageQuestions.sectionId, sectionId));

  if (questionsRaw.length > 0) {
    // A. Scramble question order
    const shuffledQuestions = shuffleArray(questionsRaw);

    // B. Fetch all options for these questions to scramble them
    const questionIds = shuffledQuestions.map((q) => q.questionId);
    const allOptions = await db
      .select({ id: examQuestionOptions.id, questionId: examQuestionOptions.questionId })
      .from(examQuestionOptions)
      .where(inArray(examQuestionOptions.questionId, questionIds));

    // C. Prepare answer rows with scrambled data
    const answerValues = shuffledQuestions.map((q, index) => {
      // Scramble option IDs for this question
      const questionOptions = allOptions
        .filter((o) => o.questionId === q.questionId)
        .map((o) => o.id);

      const shuffledOptionsOrder = shuffleArray(questionOptions);

      // Handle variable variations
      let variationIndex = 0;
      const vars = q.variableFormulas?.variables;
      if (Array.isArray(vars) && vars.length > 0) {
        variationIndex = Math.floor(Math.random() * vars.length);
      }

      return {
        sessionId: newSession.id,
        questionId: q.questionId,
        questionOrder: index + 1,
        variationIndex,
        isDoubtful: false,
        shuffledOptionsOrder,
      };
    });

    await db.insert(examSessionAnswers).values(answerValues);
  }

  return {
    success: true,
    data: { sessionId: newSession.id, isResumed: false },
  };
}
