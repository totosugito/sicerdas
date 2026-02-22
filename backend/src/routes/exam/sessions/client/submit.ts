import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examSessions } from '../../../../db/schema/exam/sessions.ts';
import { examSessionAnswers } from '../../../../db/schema/exam/session-answers.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { examQuestionOptions } from '../../../../db/schema/exam/question-options.ts';
import { examQuestionTags } from '../../../../db/schema/exam/question-tags.ts';
import { examUserStatsGlobal } from '../../../../db/schema/exam/user-stats-global.ts';
import { examUserStatsSubject } from '../../../../db/schema/exam/user-stats-subject.ts';
import { examUserStatsTag } from '../../../../db/schema/exam/user-stats-tag.ts';
import { EnumExamSessionStatus } from '../../../../db/schema/exam/enums.ts';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const SubmitSessionParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const SubmitSessionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        score: Type.Number(),
        totalCorrect: Type.Number(),
        totalQuestions: Type.Number(),
    }),
});

const submitSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/submit/:id',
        method: 'POST',
        schema: {
            tags: ['Client Exam Sessions'],
            params: SubmitSessionParams,
            response: {
                200: SubmitSessionResponse,
                403: Type.Object({ success: Type.Boolean(), message: Type.String() }),
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof SubmitSessionParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const userId = (request as any).session.user.id;

            // 1. Get and Lock Session
            const [session] = await db.select({ id: examSessions.id, status: examSessions.status })
                .from(examSessions)
                .where(and(eq(examSessions.id, id), eq(examSessions.userId, userId)))
                .limit(1);

            if (!session) {
                return reply.notFound(request.i18n.t('exam.sessions.submit.notFound'));
            }

            if (session.status !== EnumExamSessionStatus.IN_PROGRESS) {
                return reply.forbidden(request.i18n.t('exam.sessions.submit.alreadySubmitted'));
            }

            // 2. Fetch all answers and corresponding correct options, subjects, and tags
            const studentAnswers = await db.select({
                id: examSessionAnswers.id,
                questionId: examSessionAnswers.questionId,
                selectedOptionId: examSessionAnswers.selectedOptionId,
                subjectId: examQuestions.subjectId,
            })
                .from(examSessionAnswers)
                .innerJoin(examQuestions, eq(examSessionAnswers.questionId, examQuestions.id))
                .where(eq(examSessionAnswers.sessionId, id));

            const questionIds = studentAnswers.map(a => a.questionId);

            // Fetch correct options for these questions
            const correctOptions = await db.select({
                id: examQuestionOptions.id,
                questionId: examQuestionOptions.questionId,
            })
                .from(examQuestionOptions)
                .where(and(
                    inArray(examQuestionOptions.questionId, questionIds),
                    eq(examQuestionOptions.isCorrect, true)
                ));

            // Fetch tags for these questions
            const questionTagsRes = await db.select({
                questionId: examQuestionTags.questionId,
                tagId: examQuestionTags.tagId,
            })
                .from(examQuestionTags)
                .where(inArray(examQuestionTags.questionId, questionIds));

            // 3. Process Scoring & Stats Aggregation
            let totalCorrect = 0;
            const totalQuestions = studentAnswers.length;

            // Aggregators for subject and tag stats
            const subjectStatsMap = new Map<string, { total: number, correct: number, wrong: number }>();
            const tagStatsMap = new Map<string, { total: number, correct: number, wrong: number }>();

            for (const answer of studentAnswers) {
                const correct = correctOptions.find(o => o.questionId === answer.questionId);
                const isCorrect = answer.selectedOptionId === correct?.id;

                if (isCorrect) totalCorrect++;

                // Track Subject Stats
                const sId = answer.subjectId;
                if (!subjectStatsMap.has(sId)) subjectStatsMap.set(sId, { total: 0, correct: 0, wrong: 0 });
                const sStat = subjectStatsMap.get(sId)!;
                sStat.total++;
                if (isCorrect) sStat.correct++; else sStat.wrong++;

                // Track Tag Stats
                const qTags = questionTagsRes.filter(qt => qt.questionId === answer.questionId);
                for (const qt of qTags) {
                    if (!tagStatsMap.has(qt.tagId)) tagStatsMap.set(qt.tagId, { total: 0, correct: 0, wrong: 0 });
                    const tStat = tagStatsMap.get(qt.tagId)!;
                    tStat.total++;
                    if (isCorrect) tStat.correct++; else tStat.wrong++;
                }

                // Update individual answer record
                await db.update(examSessionAnswers)
                    .set({ isCorrect, updatedAt: new Date() })
                    .where(eq(examSessionAnswers.id, answer.id));
            }

            const totalWrong = totalQuestions - totalCorrect;
            const finalScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

            // 4. Update Statistics Tables (Incremental)

            // 4a. Global Stats
            await db.insert(examUserStatsGlobal)
                .values({
                    userId,
                    totalExamsTaken: 1,
                    totalQuestionsAnswered: totalQuestions,
                    totalCorrectAnswers: totalCorrect,
                    totalWrongAnswers: totalWrong,
                    averageScore: finalScore.toString(),
                    lastActiveAt: new Date(),
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: examUserStatsGlobal.userId,
                    set: {
                        totalExamsTaken: sql`${examUserStatsGlobal.totalExamsTaken} + 1`,
                        totalQuestionsAnswered: sql`${examUserStatsGlobal.totalQuestionsAnswered} + ${totalQuestions}`,
                        totalCorrectAnswers: sql`${examUserStatsGlobal.totalCorrectAnswers} + ${totalCorrect}`,
                        totalWrongAnswers: sql`${examUserStatsGlobal.totalWrongAnswers} + ${totalWrong}`,
                        averageScore: sql`(${examUserStatsGlobal.averageScore} * ${examUserStatsGlobal.totalExamsTaken} + ${finalScore}) / (${examUserStatsGlobal.totalExamsTaken} + 1)`,
                        lastActiveAt: new Date(),
                        updatedAt: new Date(),
                    }
                });

            // 4b. Subject Stats
            for (const [sId, sStat] of subjectStatsMap.entries()) {
                await db.insert(examUserStatsSubject)
                    .values({
                        userId,
                        subjectId: sId,
                        totalQuestionsAnswered: sStat.total,
                        totalCorrect: sStat.correct,
                        totalWrong: sStat.wrong,
                        accuracyRate: ((sStat.correct / sStat.total) * 100).toString(),
                        updatedAt: new Date(),
                    })
                    .onConflictDoUpdate({
                        target: [examUserStatsSubject.userId, examUserStatsSubject.subjectId],
                        set: {
                            totalQuestionsAnswered: sql`${examUserStatsSubject.totalQuestionsAnswered} + ${sStat.total}`,
                            totalCorrect: sql`${examUserStatsSubject.totalCorrect} + ${sStat.correct}`,
                            totalWrong: sql`${examUserStatsSubject.totalWrong} + ${sStat.wrong}`,
                            accuracyRate: sql`(${examUserStatsSubject.totalCorrect} + ${sStat.correct})::decimal / (${examUserStatsSubject.totalQuestionsAnswered} + ${sStat.total}) * 100`,
                            updatedAt: new Date(),
                        }
                    });
            }

            // 4c. Tag Stats
            for (const [tId, tStat] of tagStatsMap.entries()) {
                await db.insert(examUserStatsTag)
                    .values({
                        userId,
                        tagId: tId,
                        totalQuestionsAnswered: tStat.total,
                        totalCorrect: tStat.correct,
                        totalWrong: tStat.wrong,
                        accuracyRate: ((tStat.correct / tStat.total) * 100).toString(),
                        updatedAt: new Date(),
                    })
                    .onConflictDoUpdate({
                        target: [examUserStatsTag.userId, examUserStatsTag.tagId],
                        set: {
                            totalQuestionsAnswered: sql`${examUserStatsTag.totalQuestionsAnswered} + ${tStat.total}`,
                            totalCorrect: sql`${examUserStatsTag.totalCorrect} + ${tStat.correct}`,
                            totalWrong: sql`${examUserStatsTag.totalWrong} + ${tStat.wrong}`,
                            accuracyRate: sql`(${examUserStatsTag.totalCorrect} + ${tStat.correct})::decimal / (${examUserStatsTag.totalQuestionsAnswered} + ${tStat.total}) * 100`,
                            updatedAt: new Date(),
                        }
                    });
            }

            // 5. Finalize Session
            await db.update(examSessions)
                .set({
                    status: EnumExamSessionStatus.COMPLETED,
                    endTime: new Date(),
                    score: finalScore.toString(), // Score is decimal
                    updatedAt: new Date(),
                })
                .where(eq(examSessions.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.sessions.submit.success'),
                data: {
                    score: finalScore,
                    totalCorrect,
                    totalQuestions,
                }
            });
        }),
    });
};

export default submitSessionRoute;
