import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, Static } from '@sinclair/typebox';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { aiModels, aiApiLogs } from '../../db/schema/chat-ai-schema.ts';
import { db } from '../../db/index.ts';
import { eq, getTableColumns, desc, and } from 'drizzle-orm';
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from 'better-auth/node';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { EnumUserTier } from "../../db/schema/enum-app.ts";
import { EnumUserRole } from '../../db/schema/enum-auth.ts';

const GetModelParams = Type.Object({
    id: Type.String(),
});

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
    status: Type.String(),
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
        url: '/models-ai/:id',
        method: 'GET',
        schema: {
            tags: ['Chat AI'],
            params: GetModelParams,
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
            request: FastifyRequest<{ Params: Static<typeof GetModelParams> }>,
            reply: FastifyReply
        ) {
            const session = await getAuthInstance(app).api.getSession({
                headers: fromNodeHeaders(request.headers),
            });

            const user = session?.user;
            const isAdmin = user?.role === EnumUserRole.ADMIN;
            const { id } = request.params;

            // Exclude apiKey from response
            const { apiKey, ...safeColumns } = getTableColumns(aiModels);

            // Fetch model based on permissions
            let model: any;

            if (isAdmin) {
                // Admin can see any model by ID
                const [foundModel] = await db.select({
                    ...safeColumns
                })
                    .from(aiModels)
                    .where(eq(aiModels.id, id));

                model = foundModel;

            } else {
                // Users can only see enabled free models
                const [foundModel] = await db.select({
                    ...safeColumns
                })
                    .from(aiModels)
                    .where(and(
                        eq(aiModels.id, id),
                        eq(aiModels.isEnabled, true),
                        eq(aiModels.status, EnumUserTier.FREE)
                    ));

                model = foundModel;
            }

            if (!model) {
                return reply.notFound(request.i18n.t('chatAi.model.notFound'));
            }

            let stats: any = undefined;

            // Admin-specific stats calculation (last 5 logs)
            if (isAdmin) {
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
            }

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('chatAi.model.found'),
                data: {
                    ...model,
                    description: model.description || undefined,
                    createdAt: model.createdAt.toISOString(),
                    updatedAt: model.updatedAt.toISOString(),
                    ...(stats ? { stats } : {})
                }
            });
        }),
    });
};

export default detailsModelAiRoute;
