import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examSessionAnswers } from "../../../../db/schema/exam/session-answers.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../../db/schema/exam/enums.ts";
import { eq, and } from "drizzle-orm";
import { educationGrades } from "../../../../db/schema/education/index.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { SessionDetailsDataT } from "../sessions.schema.ts";

export interface DetailsSessionResult extends ServiceResponse {
  data?: SessionDetailsDataT;
}

export async function detailsSessionService(
  userId: string,
  id: string,
): Promise<DetailsSessionResult> {
  // 1. Fetch the session
  const [sessionData] = await db
    .select({
      session: examSessions,
      packageTitle: examPackages.title,
      sectionTitle: examPackageSections.title,
      gradeName: educationGrades.name,
    })
    .from(examSessions)
    .innerJoin(examPackages, eq(examSessions.packageId, examPackages.id))
    .innerJoin(examPackageSections, eq(examSessions.sectionId, examPackageSections.id))
    .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
    .where(and(eq(examSessions.id, id), eq(examSessions.userId, userId)))
    .limit(1);

  if (!sessionData) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.sessions.errors.notFound };
  }

  const { session, packageTitle, sectionTitle, gradeName } = sessionData;

  // 2. Fetch the grid (answers)
  const answers = await db
    .select({
      questionId: examSessionAnswers.questionId,
      order: examSessionAnswers.questionOrder,
      selectedOptionId: examSessionAnswers.selectedOptionId,
      textAnswer: examSessionAnswers.textAnswer,
      isDoubtful: examSessionAnswers.isDoubtful,
      isCorrect: examSessionAnswers.isCorrect,
      questionContent: examQuestions.content,
    })
    .from(examSessionAnswers)
    .innerJoin(examQuestions, eq(examSessionAnswers.questionId, examQuestions.id))
    .where(eq(examSessionAnswers.sessionId, session.id))
    .orderBy(examSessionAnswers.questionOrder);

  const grid = answers.map((ans) => {
    const isAnswered = ans.selectedOptionId !== null || ans.textAnswer !== null;

    return {
      questionId: ans.questionId,
      order: ans.order,
      isAnswered,
      isDoubtful: ans.isDoubtful,
      // Only show correctness if it's completed OR (study mode AND answered)
      isCorrect:
        session.status === EnumExamSessionStatus.COMPLETED ||
        (session.mode === EnumExamSessionMode.STUDY && isAnswered)
          ? (ans.isCorrect ?? null)
          : null,
      questionContent: ans.questionContent,
    };
  });

  return {
    success: true,
    data: {
      session: {
        id: session.id,
        packageId: session.packageId,
        status: session.status as (typeof EnumExamSessionStatus)[keyof typeof EnumExamSessionStatus],
        mode: session.mode as (typeof EnumExamSessionMode)[keyof typeof EnumExamSessionMode],
        elapsedSeconds: session.elapsedSeconds,
        isTimerActive: session.isTimerActive,
        score: session.score !== null ? Number(session.score) : null,
        earnedPoints: session.earnedPoints !== null ? Number(session.earnedPoints) : null,
        maxPoints: session.maxPoints !== null ? Number(session.maxPoints) : null,
      },
      package: {
        id: session.packageId,
        title: packageTitle,
        grade: { name: gradeName ?? null },
      },
      section: { title: sectionTitle },
      grid,
    },
  };
}
