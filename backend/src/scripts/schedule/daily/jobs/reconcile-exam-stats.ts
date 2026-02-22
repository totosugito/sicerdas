import { db } from '../../../../db/db-pool.ts';
import { examSessions } from '../../../../db/schema/exam/sessions.ts';
import { examSessionAnswers } from '../../../../db/schema/exam/session-answers.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { examQuestionTags } from '../../../../db/schema/exam/question-tags.ts';
import { examUserStatsGlobal } from '../../../../db/schema/exam/user-stats-global.ts';
import { examUserStatsSubject } from '../../../../db/schema/exam/user-stats-subject.ts';
import { examUserStatsTag } from '../../../../db/schema/exam/user-stats-tag.ts';
import { eq, sql } from 'drizzle-orm';

async function reconcileExamStats() {
    console.log('Starting exam stats reconciliation process...');

    try {
        await db.transaction(async (tx) => {
            console.log('Rebuilding Global Stats...');
            // 1. Rebuild Global Stats
            const globalData = await tx.select({
                userId: examSessions.userId,
                totalExamsTaken: sql<number>`count(distinct ${examSessions.id}) filter (where ${examSessions.status} = 'completed')`,
                totalQuestionsAnswered: sql<number>`count(${examSessionAnswers.id})`,
                totalCorrectAnswers: sql<number>`count(${examSessionAnswers.id}) filter (where ${examSessionAnswers.isCorrect} = true)`,
                totalWrongAnswers: sql<number>`count(${examSessionAnswers.id}) filter (where ${examSessionAnswers.isCorrect} = false)`,
                averageScore: sql<string>`coalesce(avg(${examSessions.score}::decimal) filter (where ${examSessions.status} = 'completed'), 0)`,
                lastActiveAt: sql<Date>`max(${examSessions.updatedAt})`,
            })
                .from(examSessions)
                .leftJoin(examSessionAnswers, eq(examSessions.id, examSessionAnswers.sessionId))
                .groupBy(examSessions.userId);

            if (globalData.length > 0) {
                await tx.insert(examUserStatsGlobal)
                    .values(globalData.map(d => ({
                        ...d,
                        totalExamsTaken: Number(d.totalExamsTaken),
                        totalQuestionsAnswered: Number(d.totalQuestionsAnswered),
                        totalCorrectAnswers: Number(d.totalCorrectAnswers),
                        totalWrongAnswers: Number(d.totalWrongAnswers),
                        lastActiveAt: d.lastActiveAt,
                        updatedAt: new Date(),
                    })))
                    .onConflictDoUpdate({
                        target: examUserStatsGlobal.userId,
                        set: {
                            totalExamsTaken: sql`excluded.total_exams_taken`,
                            totalQuestionsAnswered: sql`excluded.total_questions_answered`,
                            totalCorrectAnswers: sql`excluded.total_correct_answers`,
                            totalWrongAnswers: sql`excluded.total_wrong_answers`,
                            averageScore: sql`excluded.average_score`,
                            lastActiveAt: sql`excluded.last_active_at`,
                            updatedAt: new Date(),
                        }
                    });
            }

            console.log('Rebuilding Subject Stats...');
            // 2. Rebuild Subject Stats
            const subjectData = await tx.select({
                userId: examSessions.userId,
                subjectId: examQuestions.subjectId,
                totalQuestionsAnswered: sql<number>`count(${examSessionAnswers.id})`,
                totalCorrect: sql<number>`count(${examSessionAnswers.id}) filter (where ${examSessionAnswers.isCorrect} = true)`,
                totalWrong: sql<number>`count(${examSessionAnswers.id}) filter (where ${examSessionAnswers.isCorrect} = false)`,
                accuracyRate: sql<string>`coalesce((count(${examSessionAnswers.id}) filter (where ${examSessionAnswers.isCorrect} = true))::decimal / nullif(count(${examSessionAnswers.id}), 0) * 100, 0)`,
            })
                .from(examSessions)
                .innerJoin(examSessionAnswers, eq(examSessions.id, examSessionAnswers.sessionId))
                .innerJoin(examQuestions, eq(examSessionAnswers.questionId, examQuestions.id))
                .groupBy(examSessions.userId, examQuestions.subjectId);

            if (subjectData.length > 0) {
                await tx.insert(examUserStatsSubject)
                    .values(subjectData.map(d => ({
                        ...d,
                        totalQuestionsAnswered: Number(d.totalQuestionsAnswered),
                        totalCorrect: Number(d.totalCorrect),
                        totalWrong: Number(d.totalWrong),
                        updatedAt: new Date(),
                    })))
                    .onConflictDoUpdate({
                        target: [examUserStatsSubject.userId, examUserStatsSubject.subjectId],
                        set: {
                            totalQuestionsAnswered: sql`excluded.total_questions_answered`,
                            totalCorrect: sql`excluded.total_correct`,
                            totalWrong: sql`excluded.total_wrong`,
                            accuracyRate: sql`excluded.accuracy_rate`,
                            updatedAt: new Date(),
                        }
                    });
            }

            console.log('Rebuilding Tag Stats...');
            // 3. Rebuild Tag Stats
            const tagData = await tx.select({
                userId: examSessions.userId,
                tagId: examQuestionTags.tagId,
                totalQuestionsAnswered: sql<number>`count(${examSessionAnswers.id})`,
                totalCorrect: sql<number>`count(${examSessionAnswers.id}) filter (where ${examSessionAnswers.isCorrect} = true)`,
                totalWrong: sql<number>`count(${examSessionAnswers.id}) filter (where ${examSessionAnswers.isCorrect} = false)`,
                accuracyRate: sql<string>`coalesce((count(${examSessionAnswers.id}) filter (where ${examSessionAnswers.isCorrect} = true))::decimal / nullif(count(${examSessionAnswers.id}), 0) * 100, 0)`,
            })
                .from(examSessions)
                .innerJoin(examSessionAnswers, eq(examSessions.id, examSessionAnswers.sessionId))
                .innerJoin(examQuestionTags, eq(examSessionAnswers.questionId, examQuestionTags.questionId))
                .groupBy(examSessions.userId, examQuestionTags.tagId);

            if (tagData.length > 0) {
                await tx.insert(examUserStatsTag)
                    .values(tagData.map(d => ({
                        ...d,
                        totalQuestionsAnswered: Number(d.totalQuestionsAnswered),
                        totalCorrect: Number(d.totalCorrect),
                        totalWrong: Number(d.totalWrong),
                        updatedAt: new Date(),
                    })))
                    .onConflictDoUpdate({
                        target: [examUserStatsTag.userId, examUserStatsTag.tagId],
                        set: {
                            totalQuestionsAnswered: sql`excluded.total_questions_answered`,
                            totalCorrect: sql`excluded.total_correct`,
                            totalWrong: sql`excluded.total_wrong`,
                            accuracyRate: sql`excluded.accuracy_rate`,
                            updatedAt: new Date(),
                        }
                    });
            }
        });

        return {
            success: true,
            message: 'Exam stats reconciled successfully'
        };

    } catch (error) {
        console.error('Error reconciling exam stats:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    reconcileExamStats()
        .then((result) => {
            console.log('Result:', JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch((error) => {
            console.error('Reconciliation job failed:', error);
            process.exit(1);
        });
}

export default reconcileExamStats;
