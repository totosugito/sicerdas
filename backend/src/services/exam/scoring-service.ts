import { db as defaultDb } from "../../db/db-pool.ts";
import { examPackageSections } from "../../db/schema/exam/package-sections.ts";
import { examPackageQuestions } from "../../db/schema/exam/package-questions.ts";
import { examQuestions } from "../../db/schema/exam/questions.ts";
import { examQuestionOptions } from "../../db/schema/exam/question-options.ts";
import { EnumScoringStrategy } from "../../db/schema/exam/enums.ts";
import { eq, sql, and } from "drizzle-orm";

/**
 * ScoringService
 *
 * Handles complex calculations for exam scoring and metadata aggregation.
 */
export class ScoringService {
  /**
   * Synchronizes a question's maxScore based on its options and scoring strategy.
   * Then triggers recalculation for all sections that use this question.
   */
  static async syncQuestionMaxScore(questionId: string): Promise<void> {
    await defaultDb.transaction(async (tx) => {
      // 1. Get question details
      const [question] = await tx
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
        const [sumResult] = await tx
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
        const [maxResult] = await tx
          .select({
            max: sql<number>`COALESCE(MAX(${examQuestionOptions.score}), 0)`,
          })
          .from(examQuestionOptions)
          .where(eq(examQuestionOptions.questionId, questionId));
        maxScore = Number(maxResult?.max || 0);
      }

      // Default to 1 if no options have scores yet to prevent division by zero in UI
      if (maxScore <= 0) maxScore = 1;

      // 3. Update question maxScore
      await tx
        .update(examQuestions)
        .set({ maxScore, updatedAt: new Date() })
        .where(eq(examQuestions.id, questionId));

      // 4. Find all sections that use this question and recalculate them
      const relatedSections = await tx
        .select({ sectionId: examPackageQuestions.sectionId })
        .from(examPackageQuestions)
        .where(eq(examPackageQuestions.questionId, questionId));

      for (const { sectionId } of relatedSections) {
        await this.recalculateSectionMaxScore(sectionId, tx);
      }
    });
  }

  /**
   * Recalculates and updates the denormalized maxScore for a section.
   * Sums up maxScore from all questions linked via exam_package_questions.
   */
  static async recalculateSectionMaxScore(sectionId: string, tx?: any): Promise<number> {
    const client = tx || defaultDb;

    const [result] = await client
      .select({
        totalMaxScore: sql<number>`COALESCE(SUM(${examQuestions.maxScore}), 0)`,
      })
      .from(examPackageQuestions)
      .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
      .where(eq(examPackageQuestions.sectionId, sectionId));

    const newMaxScore = Number(result?.totalMaxScore || 0);

    await client
      .update(examPackageSections)
      .set({
        maxScore: newMaxScore,
        updatedAt: new Date(),
      })
      .where(eq(examPackageSections.id, sectionId));

    return newMaxScore;
  }
}
