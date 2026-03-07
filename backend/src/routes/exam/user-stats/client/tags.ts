import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examUserStatsTag } from '../../../../db/schema/exam/user-stats-tag.ts';
import { educationTags } from '../../../../db/schema/education/tags.ts';
import { eq, desc } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const TagStatsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(Type.Object({
        id: Type.String({ format: 'uuid' }),
        tagId: Type.String({ format: 'uuid' }),
        tagName: Type.String(),
        totalQuestionsAnswered: Type.Number(),
        totalCorrect: Type.Number(),
        totalWrong: Type.Number(),
        accuracyRate: Type.String(),
        updatedAt: Type.String({ format: 'date-time' }),
    })),
});

const getTagStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/tags',
        method: 'GET',
        schema: {
            tags: ['Client Exam Analytics'],
            response: {
                200: TagStatsResponse,
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const userId = (request as any).session.user.id;

            const stats = await db.select({
                id: examUserStatsTag.id,
                tagId: examUserStatsTag.tagId,
                tagName: educationTags.name,
                totalQuestionsAnswered: examUserStatsTag.totalQuestionsAnswered,
                totalCorrect: examUserStatsTag.totalCorrect,
                totalWrong: examUserStatsTag.totalWrong,
                accuracyRate: examUserStatsTag.accuracyRate,
                updatedAt: examUserStatsTag.updatedAt,
            })
                .from(examUserStatsTag)
                .innerJoin(educationTags, eq(examUserStatsTag.tagId, educationTags.id))
                .where(eq(examUserStatsTag.userId, userId))
                .orderBy(desc(examUserStatsTag.accuracyRate));

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.user_stats.tags.success),
                data: stats.map(s => ({
                    ...s,
                    updatedAt: s.updatedAt.toISOString(),
                })),
            });
        }),
    });
};

export default getTagStatsRoute;
