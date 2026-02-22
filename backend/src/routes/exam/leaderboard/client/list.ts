import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examUserStatsGlobal } from '../../../../db/schema/exam/user-stats-global.ts';
import { users } from '../../../../db/schema/user/users.ts';
import { eq, desc } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const LeaderboardResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(Type.Object({
        rank: Type.Number(),
        userId: Type.String({ format: 'uuid' }),
        name: Type.Union([Type.String(), Type.Null()]),
        averageScore: Type.String(),
        totalExamsTaken: Type.Number(),
    })),
});

const leaderboardRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'GET',
        schema: {
            tags: ['Client Exam Leaderboard'],
            response: {
                200: LeaderboardResponse,
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest,
            reply: FastifyReply
        ) {
            // Get top 50 users by average score
            const ranking = await db.select({
                userId: examUserStatsGlobal.userId,
                name: users.name,
                averageScore: examUserStatsGlobal.averageScore,
                totalExamsTaken: examUserStatsGlobal.totalExamsTaken,
            })
                .from(examUserStatsGlobal)
                .innerJoin(users, eq(examUserStatsGlobal.userId, users.id))
                .orderBy(desc(examUserStatsGlobal.averageScore))
                .limit(50);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.leaderboard.list.success'),
                data: ranking.map((r, index) => ({
                    ...r,
                    rank: index + 1,
                })),
            });
        }),
    });
};

export default leaderboardRoute;
