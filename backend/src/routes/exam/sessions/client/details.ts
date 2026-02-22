import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examSessions } from '../../../../db/schema/exam/sessions.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { examSessionAnswers } from '../../../../db/schema/exam/session-answers.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { examQuestionOptions } from '../../../../db/schema/exam/question-options.ts';
import { eq, and, inArray } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const SessionDetailsParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const SessionDetailsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        session: Type.Object({
            id: Type.String({ format: 'uuid' }),
            startTime: Type.String({ format: 'date-time' }),
            status: Type.String(),
            package: Type.Object({
                title: Type.String(),
                durationMinutes: Type.Number(),
            }),
        }),
        answers: Type.Array(Type.Object({
            questionId: Type.String({ format: 'uuid' }),
            questionOrder: Type.Number(),
            isDoubtful: Type.Boolean(),
            selectedOptionId: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
            textAnswer: Type.Optional(Type.Union([Type.Array(Type.Record(Type.String(), Type.Unknown())), Type.Null()])),
            question: Type.Object({
                content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
                type: Type.String(),
                options: Type.Array(Type.Object({
                    id: Type.String({ format: 'uuid' }),
                    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
                })),
            }),
        })),
    }),
});

const sessionDetailsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/details/:id',
        method: 'GET',
        schema: {
            tags: ['Client Exam Sessions'],
            params: SessionDetailsParams,
            response: {
                200: SessionDetailsResponse,
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof SessionDetailsParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const userId = (request as any).session.user.id;

            // 1. Get Session & Package Info
            const [session] = await db.select({
                id: examSessions.id,
                startTime: examSessions.startTime,
                status: examSessions.status,
                package: {
                    title: examPackages.title,
                    durationMinutes: examPackages.durationMinutes,
                }
            })
                .from(examSessions)
                .innerJoin(examPackages, eq(examSessions.packageId, examPackages.id))
                .where(and(eq(examSessions.id, id), eq(examSessions.userId, userId)))
                .limit(1);

            if (!session) {
                return reply.notFound(request.i18n.t('exam.sessions.details.notFound'));
            }

            // 2. Get Answers, Questions, and Options
            const answersRaw = await db.select({
                questionId: examSessionAnswers.questionId,
                questionOrder: examSessionAnswers.questionOrder,
                isDoubtful: examSessionAnswers.isDoubtful,
                selectedOptionId: examSessionAnswers.selectedOptionId,
                textAnswer: examSessionAnswers.textAnswer,
                question: {
                    content: examQuestions.content,
                    type: examQuestions.type,
                }
            })
                .from(examSessionAnswers)
                .innerJoin(examQuestions, eq(examSessionAnswers.questionId, examQuestions.id))
                .where(eq(examSessionAnswers.sessionId, id))
                .orderBy(examSessionAnswers.questionOrder);

            // 3. Fetch all options for these questions
            const questionIds = answersRaw.map(a => a.questionId);
            const allOptions = await db.select({
                id: examQuestionOptions.id,
                questionId: examQuestionOptions.questionId,
                content: examQuestionOptions.content,
            })
                .from(examQuestionOptions)
                .where(inArray(examQuestionOptions.questionId, questionIds));
            // Filter options in memory for easier grouping or execute separate queries. 
            // For exam scale, fetching all active options is fine or use inArray.

            const resultAnswers = answersRaw.map(ans => ({
                ...ans,
                question: {
                    ...ans.question,
                    options: allOptions.filter(o => o.questionId === ans.questionId).map(o => ({
                        id: o.id,
                        content: o.content
                    }))
                }
            }));

            return reply.status(200).send({
                success: true,
                message: 'OK',
                data: {
                    session: {
                        ...session,
                        startTime: session.startTime.toISOString(),
                    },
                    answers: resultAnswers as any,
                }
            });
        }),
    });
};

export default sessionDetailsRoute;
