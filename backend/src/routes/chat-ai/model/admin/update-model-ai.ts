import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { aiModels } from '../../../../db/schema/chat-ai-schema.ts';
import { db } from '../../../../db/index.ts';
import { eq, ne, and, or } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";


const UpdateModelParams = Type.Object({
    id: Type.String(),
});

const UpdateModelBody = Type.Object({
    name: Type.Optional(Type.String({ minLength: 1 })),
    provider: Type.Optional(Type.String({ minLength: 1 })),
    modelIdentifier: Type.Optional(Type.String({ minLength: 1 })),
    apiKey: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    maxTokens: Type.Optional(Type.Number()),
    supportsImage: Type.Optional(Type.Boolean()),
    supportsFile: Type.Optional(Type.Boolean()),
    acceptedImageExtensions: Type.Optional(Type.Array(Type.String())),
    acceptedFileExtensions: Type.Optional(Type.Array(Type.String())),
    maxFileSize: Type.Optional(Type.Number()),
    isDefault: Type.Optional(Type.Boolean()),
    isEnabled: Type.Optional(Type.Boolean()),
    requiredTierId: Type.Optional(Type.String()),
    tierCapabilities: Type.Optional(Type.Record(Type.String(), Type.Object({
        supportsImage: Type.Optional(Type.Boolean()),
        supportsFile: Type.Optional(Type.Boolean()),
        maxFileSize: Type.Optional(Type.Number()),
        maxTokens: Type.Optional(Type.Number()),
    }))),
    extra: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});

const ModelResponseItem = Type.Object({
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

const UpdateModelResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Optional(ModelResponseItem),
});

const updateModelAiRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/models-ai/:id',
        method: 'PATCH',
        schema: {
            tags: ['Chat AI'],
            params: UpdateModelParams,
            body: UpdateModelBody,
            response: {
                200: UpdateModelResponse,
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
            request: FastifyRequest<{ Params: typeof UpdateModelParams.static, Body: typeof UpdateModelBody.static }>,
            reply: FastifyReply
        ): Promise<typeof UpdateModelResponse.static> {
            const { id } = request.params;
            const { name, provider, modelIdentifier } = request.body;

            // Check if model exists
            const [existingModel] = await db.select().from(aiModels).where(eq(aiModels.id, id));

            if (!existingModel) {
                return reply.notFound(request.i18n.t('chatAi.model.notFound'));
            }

            // Check for duplicates if name or details are being updated
            if (name || (provider && modelIdentifier)) {
                const targetName = name || existingModel.name;
                const targetProvider = provider || existingModel.provider;
                const targetIdentifier = modelIdentifier || existingModel.modelIdentifier;

                const duplicateCheck = await db.query.aiModels.findFirst({
                    where: and(
                        ne(aiModels.id, id), // Exclude current model
                        or(
                            eq(aiModels.name, targetName),
                            and(
                                eq(aiModels.provider, targetProvider),
                                eq(aiModels.modelIdentifier, targetIdentifier)
                            )
                        )
                    )
                });

                if (duplicateCheck) {
                    return reply.badRequest(request.i18n.t('chatAi.model.create.exists'));
                }
            }

            // Update
            const [updatedModel] = await db.update(aiModels)
                .set({
                    ...request.body,
                    updatedAt: new Date(),
                })
                .where(eq(aiModels.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('chatAi.model.update.success'),
                data: {
                    ...updatedModel,
                    description: updatedModel.description || undefined,
                    createdAt: updatedModel.createdAt.toISOString(),
                    updatedAt: updatedModel.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default updateModelAiRoute;
