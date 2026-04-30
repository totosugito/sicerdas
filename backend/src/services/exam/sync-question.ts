import { db as defaultDb } from "../../db/db-pool.ts";
import { examQuestions } from "../../db/schema/exam/questions.ts";
import { examQuestionOptions } from "../../db/schema/exam/question-options.ts";
import { examPackageQuestions } from "../../db/schema/exam/package-questions.ts";
import { EnumScoringStrategy } from "../../db/schema/exam/enums.ts";
import { eq, sql, and } from "drizzle-orm";
import { syncSection } from "./sync-section.ts";

/**
 * Synchronizes a question's maxScore based on its options and scoring strategy.
 * Then triggers recalculation for all sections that use this question.
 */
export async function syncQuestionMaxScore(questionId: string, tx?: any): Promise<void> {
  const client = tx || defaultDb;

  // 1. Get question details
  const [question] = await client
    .select({
      id: examQuestions.id,
      scoringStrategy: examQuestions.scoringStrategy,
    })
    .from(examQuestions)
    .where(eq(examQuestions.id, questionId))
    .limit(1);

  if (!question) return;

  // 2. Calculate max possible points from options
  let maxScore = 0;
  if (
    question.scoringStrategy === EnumScoringStrategy.PARTIAL ||
    question.scoringStrategy === EnumScoringStrategy.PARTIAL_WITH_PENALTY
  ) {
    // Sum of all correct options
    const [sumResult] = await client
      .select({
        total: sql<number>`COALESCE(SUM(${examQuestionOptions.score}), 0)`,
      })
      .from(examQuestionOptions)
      .where(
        and(
          eq(examQuestionOptions.questionId, questionId),
          eq(examQuestionOptions.isCorrect, true),
        ),
      );
    maxScore = Number(sumResult?.total || 0);
  } else {
    // Max score of any option
    const [maxResult] = await client
      .select({
        max: sql<number>`COALESCE(MAX(${examQuestionOptions.score}), 0)`,
      })
      .from(examQuestionOptions)
      .where(eq(examQuestionOptions.questionId, questionId));
    maxScore = Number(maxResult?.max || 0);
  }

  // Default to 1 if no options have scores yet
  if (maxScore <= 0) maxScore = 1;

  // 3. Update question maxScore
  await client
    .update(examQuestions)
    .set({ maxScore, updatedAt: new Date() })
    .where(eq(examQuestions.id, questionId));

  // 4. Find all sections that use this question
  const relatedSections = await client
    .select({ sectionId: examPackageQuestions.sectionId })
    .from(examPackageQuestions)
    .where(eq(examPackageQuestions.questionId, questionId));

  // 5. Sync each affected section
  for (const rs of relatedSections) {
    await syncSection(rs.sectionId, client);
  }
}
