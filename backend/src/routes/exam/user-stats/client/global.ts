import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examUserStatsGlobal } from '../../../../db/schema/exam/user-stats-global.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const GlobalStatsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Union([
        Type.Object({
            userId: Type.String({ format: 'uuid' }),
            totalExamsTaken: Type.Number(),
            totalQuestionsAnswered: Type.Number(),
            totalCorrectAnswers: Type.Number(),
            totalWrongAnswers: Type.Number(),
            averageScore: Type.String(),
            lastActiveAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
            updatedAt: Type.String({ format: 'date-time' }),
        }),
        Type.Null()
    ]),
});

const getGlobalStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/global',
        method: 'GET',
        schema: {
            tags: ['Client Exam Analytics'],
            response: {
                200: GlobalStatsResponse,
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest,
            reply: FastifyReply
        ) {
            const userId = (request as any).session.user.id;

            const [stats] = await db.select()
                .from(examUserStatsGlobal)
                .where(eq(examUserStatsGlobal.userId, userId))
                .limit(1);

            if (!stats) {
                return reply.status(200).send({
                    success: true,
                    message: request.i18n.t('exam.user-stats.global.notFound'),
                    data: null,
                });
            }

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.user-stats.global.success'),
                data: {
                    ...stats,
                    lastActiveAt: stats.lastActiveAt?.toISOString() || null,
                    updatedAt: stats.updatedAt.toISOString(),
                },
            });
        }),
    });
};

export default getGlobalStatsRoute;
