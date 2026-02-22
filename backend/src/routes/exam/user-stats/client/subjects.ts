import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examUserStatsSubject } from '../../../../db/schema/exam/user-stats-subject.ts';
import { examSubjects } from '../../../../db/schema/exam/subjects.ts';
import { eq, desc } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const SubjectStatsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(Type.Object({
        id: Type.String({ format: 'uuid' }),
        subjectId: Type.String({ format: 'uuid' }),
        subjectName: Type.String(),
        totalQuestionsAnswered: Type.Number(),
        totalCorrect: Type.Number(),
        totalWrong: Type.Number(),
        accuracyRate: Type.String(),
        updatedAt: Type.String({ format: 'date-time' }),
    })),
});

const getSubjectStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/subjects',
        method: 'GET',
        schema: {
            tags: ['Client Exam Analytics'],
            response: {
                200: SubjectStatsResponse,
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest,
            reply: FastifyReply
        ) {
            const userId = (request as any).session.user.id;

            const stats = await db.select({
                id: examUserStatsSubject.id,
                subjectId: examUserStatsSubject.subjectId,
                subjectName: examSubjects.name,
                totalQuestionsAnswered: examUserStatsSubject.totalQuestionsAnswered,
                totalCorrect: examUserStatsSubject.totalCorrect,
                totalWrong: examUserStatsSubject.totalWrong,
                accuracyRate: examUserStatsSubject.accuracyRate,
                updatedAt: examUserStatsSubject.updatedAt,
            })
                .from(examUserStatsSubject)
                .innerJoin(examSubjects, eq(examUserStatsSubject.subjectId, examSubjects.id))
                .where(eq(examUserStatsSubject.userId, userId))
                .orderBy(desc(examUserStatsSubject.accuracyRate));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.user-stats.subjects.success'),
                data: stats.map(s => ({
                    ...s,
                    updatedAt: s.updatedAt.toISOString(),
                })),
            });
        }),
    });
};

export default getSubjectStatsRoute;
