import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { aiApiLogs, aiModels } from '../../../../db/schema/ai/index.ts';
import { db } from '../../../../db/db-pool.ts';
import { eq, desc, asc, and, gte, lte, sql } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { Type } from '@sinclair/typebox';

const StatsQueryWrapper = Type.Object({
    modelId: Type.Optional(Type.String()),
    periodStart: Type.Optional(Type.String({ format: 'date-time' })),
    periodEnd: Type.Optional(Type.String({ format: 'date-time' })),
    limit: Type.Optional(Type.Number({ default: 100 })),
    offset: Type.Optional(Type.Number({ default: 0 })),
    sortBy: Type.Optional(Type.String({ default: 'periodStart' })), // periodStart, totalRequests, etc.
    sortOrder: Type.Optional(Type.String({ default: 'desc' })), // asc, desc
});

const LogItem = Type.Object({
    id: Type.String(),
    modelId: Type.String(),
    periodStart: Type.String({ format: 'date-time' }),
    periodEnd: Type.String({ format: 'date-time' }),
    successCount: Type.Number(),
    failureCount: Type.Number(),
    totalRequests: Type.Number(),
    avgDuration: Type.Optional(Type.Number()),
    totalTokens: Type.Optional(Type.Number()),
    createdAt: Type.String({ format: 'date-time' }),
    modelName: Type.Optional(Type.String()), // Enriched field
});

const GetStatsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(LogItem),
    meta: Type.Object({
        total: Type.Number(),
        limit: Type.Number(),
        offset: Type.Number(),
    })
});

const modelsAiStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/models/stats',
        method: 'GET',
        schema: {
            tags: ['Chat AI'],
            querystring: StatsQueryWrapper,
            response: {
                200: GetStatsResponse,
                '4xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                }),
                '5xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                })
            }
        },
        handler: withErrorHandler(async function handler(
            req: FastifyRequest<{ Querystring: typeof StatsQueryWrapper.static }>,
            reply: FastifyReply
        ): Promise<typeof GetStatsResponse.static> {
            const {
                modelId,
                periodStart,
                periodEnd,
                limit = 100,
                offset = 0,
                sortBy = 'periodStart',
                sortOrder = 'desc'
            } = req.query;

            // Build where conditions
            const conditions = [];
            if (modelId) conditions.push(eq(aiApiLogs.modelId, modelId));
            if (periodStart) conditions.push(gte(aiApiLogs.periodStart, new Date(periodStart)));
            if (periodEnd) conditions.push(lte(aiApiLogs.periodEnd, new Date(periodEnd)));

            // Build sorting
            let orderByClause;
            const sortColumn = sortBy === 'totalRequests' ? aiApiLogs.totalRequests
                : sortBy === 'successCount' ? aiApiLogs.successCount
                    : sortBy === 'failureCount' ? aiApiLogs.failureCount
                        : sortBy === 'avgDuration' ? aiApiLogs.avgDuration
                            : sortBy === 'totalTokens' ? aiApiLogs.totalTokens
                                : aiApiLogs.periodStart;

            orderByClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

            // Execute count query
            const [totalResult] = await db.select({ count: sql<number>`count(*)` })
                .from(aiApiLogs)
                .where(and(...conditions));

            const total = Number(totalResult?.count || 0);

            // Execute data query with join to get model name
            const logs = await db.select({
                id: aiApiLogs.id,
                modelId: aiApiLogs.modelId,
                periodStart: aiApiLogs.periodStart,
                periodEnd: aiApiLogs.periodEnd,
                successCount: aiApiLogs.successCount,
                failureCount: aiApiLogs.failureCount,
                totalRequests: aiApiLogs.totalRequests,
                avgDuration: aiApiLogs.avgDuration,
                totalTokens: aiApiLogs.totalTokens,
                createdAt: aiApiLogs.createdAt,
                modelName: aiModels.name,
            })
                .from(aiApiLogs)
                .leftJoin(aiModels, eq(aiApiLogs.modelId, aiModels.id))
                .where(and(...conditions))
                .orderBy(orderByClause)
                .limit(limit)
                .offset(offset);

            const result = logs.map(log => ({
                ...log,
                periodStart: log.periodStart.toISOString(),
                periodEnd: log.periodEnd.toISOString(),
                createdAt: log.createdAt.toISOString(),
                avgDuration: log.avgDuration || 0,
                totalTokens: log.totalTokens || 0,
                modelName: log.modelName || undefined
            }));

            return reply.status(200).send({
                success: true,
                message: req.i18n.t('chatAi.stats.success'),
                data: result,
                meta: {
                    total,
                    limit,
                    offset
                }
            });
        }),
    });
};

export default modelsAiStatsRoute;
