import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { aiModels } from '../../db/schema/chat-ai-schema.ts';
import { userProfile } from '../../db/schema/auth-schema.ts';
import { tierPricing } from '../../db/schema/tier-pricing.ts';
import { db } from '../../db/index.ts';
import { eq, getTableColumns, desc, asc } from 'drizzle-orm';
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from 'better-auth/node';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
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
    requiredTierId: Type.Optional(Type.String()),
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

            // 1. Get User's Tier Info (sortOrder, slug)
            let userTierOrder = 0; // Default to lowest
            let userTierSlug = 'free'; // Default slug

            if (user?.id) {
                const [userData] = await db.select({
                    tierSlug: tierPricing.slug,
                    tierOrder: tierPricing.sortOrder,
                })
                    .from(userProfile)
                    .leftJoin(tierPricing, eq(userProfile.tierId, tierPricing.id))
                    .where(eq(userProfile.id, user.id));

                if (userData) {
                    if (userData.tierOrder !== null) userTierOrder = userData.tierOrder;
                    if (userData.tierSlug) userTierSlug = userData.tierSlug;
                }
            }

            // Exclude apiKey from response
            const { apiKey, ...safeColumns } = getTableColumns(aiModels);

            // 2. Fetch Models with their Required Tier Info
            // We join with tierPricing to get the sortOrder of the required tier
            const modelsData = await db.select({
                ...safeColumns,
                requiredTierOrder: tierPricing.sortOrder,
            })
                .from(aiModels)
                .leftJoin(tierPricing, eq(aiModels.requiredTierId, tierPricing.id))
                .where(eq(aiModels.isEnabled, true))
                .orderBy(asc(tierPricing.sortOrder), desc(aiModels.isDefault));

            // 3. Filter Models
            // Logic: User sees model IF:
            //   - User is Admin OR
            //   - Model has no required tier (null) OR
            //   - User's tier sortOrder >= Model's required tier sortOrder

            const filteredModels = modelsData.filter(model => {
                if (isAdmin) return true;
                if (!model.requiredTierId) return true; // No requirement
                const requiredOrder = model.requiredTierOrder || 0;
                return userTierOrder >= requiredOrder;
            });

            // 4. Map and Apply Capabilities Overrides
            const result = filteredModels.map((model) => {
                let mergedModel = { ...model };

                // Delete the joined column before returning
                delete (mergedModel as any).requiredTierOrder;

                // Check if there are specific capabilities for the user's tier slug
                // tierCapabilities is Record<string, overrides> where string is the tier slug
                if (model.tierCapabilities && (model.tierCapabilities as any)[userTierSlug]) {
                    const overrides = (model.tierCapabilities as any)[userTierSlug];
                    mergedModel = {
                        ...mergedModel,
                        ...overrides
                    };
                }

                return {
                    ...mergedModel,
                    description: mergedModel.description || undefined,
                    requiredTierId: mergedModel.requiredTierId || undefined,
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
