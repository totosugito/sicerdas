import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { aiModels } from '../../db/schema/chat-ai-schema.ts';
import { userProfile } from '../../db/schema/auth-schema.ts';
import { db } from '../../db/index.ts';
import { eq, getTableColumns, and, inArray } from 'drizzle-orm';
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from 'better-auth/node';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { EnumUserTier } from "../../db/schema/enum-app.ts";
import { EnumUserRole } from '../../db/schema/enum-auth.ts';

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
    tierCapabilities: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const ModelsResponseWrapper = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(ModelItem),
});

const modelsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/models-ai',
        method: 'GET',
        schema: {
            tags: ['Chat AI'],
            response: {
                200: ModelsResponseWrapper,
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
        handler: withErrorHandler(async function handler(request, reply) {
            const session = await getAuthInstance(app).api.getSession({
                headers: fromNodeHeaders(request.headers),
            });

            const user = session?.user;
            const isAdmin = user?.role === EnumUserRole.ADMIN;

            // Get user tier from profile
            let userTier: string = EnumUserTier.FREE;
            if (user?.id) {
                const [profile] = await db.select({ status: userProfile.status })
                    .from(userProfile)
                    .where(eq(userProfile.id, user.id));
                if (profile?.status) {
                    userTier = profile.status as any;
                }
            }

            let baseQuery: any;

            // Exclude apiKey from response
            const { apiKey, ...safeColumns } = getTableColumns(aiModels);

            if (isAdmin) {
                baseQuery = db.select({
                    ...safeColumns,
                })
                    .from(aiModels);
            } else {
                // Define visible tiers based on user tier
                // Free users see: FREE
                // Pro users see: FREE, PRO
                const visibleTiers: string[] = [EnumUserTier.FREE];
                if (userTier === EnumUserTier.PRO) {
                    visibleTiers.push(EnumUserTier.PRO);
                }

                baseQuery = db.select({
                    ...safeColumns
                })
                    .from(aiModels)
                    .where(and(
                        eq(aiModels.isEnabled, true),
                        inArray(aiModels.status, visibleTiers)
                    ));
            }

            const models = await baseQuery;

            const result = models.map((model: any) => {
                // Apply tier capabilities override
                let mergedModel = { ...model };

                // Check if there are specific capabilities for the user's tier
                if (model.tierCapabilities && model.tierCapabilities[userTier]) {
                    const overrides = model.tierCapabilities[userTier];
                    mergedModel = {
                        ...mergedModel,
                        ...overrides
                    };
                }

                return {
                    ...mergedModel,
                    description: mergedModel.description || undefined,
                    createdAt: mergedModel.createdAt.toISOString(),
                    updatedAt: mergedModel.updatedAt.toISOString(),
                };
            });

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('chatAi.listSuccess'),
                data: result
            });
        }),
    });
};

export default modelsRoute;
