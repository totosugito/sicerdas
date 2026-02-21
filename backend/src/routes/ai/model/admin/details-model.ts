import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { aiModels, aiApiLogs } from '../../../../db/schema/ai/index.ts';
import { db } from '../../../../db/db-pool.ts';
import { eq, getTableColumns, desc } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { Type } from '@sinclair/typebox';

const ModelItem = Type.Object({
    id: Type.String(),
    name: Type.String(),
    provider: Type.String(),
    description: Type.Optional(Type.String()),
    modelIdentifier: Type.String(),
    maxTokens: Type.Optional(Type.Number()),
    supportsImage: Type.Boolean(),
    supportsFile: Type.Boolean(),
    acceptedImageExtensions: Type.Optional(Type.Array(Type.String())),
    acceptedFileExtensions: Type.Optional(Type.Array(Type.String())),
    maxFileSize: Type.Optional(Type.Number()),
    isDefault: Type.Boolean(),
    requiredTierId: Type.Optional(Type.String()),
    tierCapabilities: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    stats: Type.Optional(Type.Array(Type.Object({
        date: Type.String(),
        successCount: Type.Number(),
        totalRequests: Type.Number(),
        avgDuration: Type.Number(),
    })))
});

const GetModelResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: ModelItem,
});

const detailsModelAiRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/model/:id',
        method: 'GET',
        schema: {
            tags: ['Chat AI'],
            params: Type.Object({
                id: Type.String(),
            }),
            response: {
                200: GetModelResponse,
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
            req: FastifyRequest<{ Params: { id: string } }>,
            reply: FastifyReply
        ): Promise<typeof GetModelResponse.static> {
            const { id } = req.params;

            // This route is protected by adminHook, so only admins can access it
            // Exclude apiKey from response
            const { apiKey, ...safeColumns } = getTableColumns(aiModels);

            // Fetch model
            const [model] = await db.select({
                ...safeColumns
            })
                .from(aiModels)
                .where(eq(aiModels.id, id));

            if (!model) {
                return reply.notFound(req.i18n.t('chatAi.model.notFound'));
            }

            let stats: any = undefined;

            // Admin-specific stats calculation (last 5 logs)
            const logs = await db.select({
                periodStart: aiApiLogs.periodStart,
                successCount: aiApiLogs.successCount,
                totalRequests: aiApiLogs.totalRequests,
                avgDuration: aiApiLogs.avgDuration,
            })
                .from(aiApiLogs)
                .where(eq(aiApiLogs.modelId, model.id))
                .orderBy(desc(aiApiLogs.periodStart))
                .limit(5);

            stats = logs.map(log => ({
                date: log.periodStart.toISOString(),
                successCount: log.successCount,
                totalRequests: log.totalRequests,
                avgDuration: log.avgDuration || 0,
            }));

            return reply.status(200).send({
                success: true,
                message: req.i18n.t('chatAi.model.found'),
                data: {
                    ...model,
                    description: model.description || undefined,
                    requiredTierId: model.requiredTierId || undefined,
                    createdAt: model.createdAt.toISOString(),
                    updatedAt: model.updatedAt.toISOString(),
                    ...(stats ? { stats } : {})
                }
            });
        }),
    });
};

export default detailsModelAiRoute;
