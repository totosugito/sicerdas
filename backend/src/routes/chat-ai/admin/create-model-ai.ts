import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { aiModels } from '../../../db/schema/chat-ai-schema.ts';
import { db } from '../../../db/index.ts';
import { eq, or, and } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";


const CreateModelBody = Type.Object({
    name: Type.String({ minLength: 1 }),
    provider: Type.String({ minLength: 1 }),
    modelIdentifier: Type.String({ minLength: 1 }),
    apiKey: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    maxTokens: Type.Optional(Type.Number()),
    supportsImage: Type.Boolean({ default: false }),
    supportsFile: Type.Boolean({ default: false }),
    acceptedImageExtensions: Type.Optional(Type.Array(Type.String())),
    acceptedFileExtensions: Type.Optional(Type.Array(Type.String())),
    maxFileSize: Type.Optional(Type.Number()),
    isDefault: Type.Optional(Type.Boolean({ default: false })),
    isEnabled: Type.Optional(Type.Boolean({ default: true })),
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

const CreateModelResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: ModelResponseItem,
});

const createModelAiRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create-model-ai',
        method: 'POST',
        schema: {
            tags: ['Chat AI'],
            body: CreateModelBody,
            response: {
                200: CreateModelResponse,
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
            request: FastifyRequest<{ Body: typeof CreateModelBody.static }>,
            reply: FastifyReply
        ): Promise<typeof CreateModelResponse.static> {
            const { name, provider, modelIdentifier } = request.body;

            const existingModel = await db.query.aiModels.findFirst({
                where: or(
                    eq(aiModels.name, name),
                    and(
                        eq(aiModels.provider, provider),
                        eq(aiModels.modelIdentifier, modelIdentifier)
                    )
                )
            });

            if (existingModel) {
                return reply.badRequest(request.i18n.t('chatAi.model.create.exists'));
            }

            const [newModel] = await db.insert(aiModels).values({
                ...request.body,
                requiredTierId: request.body.requiredTierId || null,
                isDefault: request.body.isDefault || false,
                isEnabled: request.body.isEnabled !== undefined ? request.body.isEnabled : true,
                supportsImage: request.body.supportsImage || false,
                supportsFile: request.body.supportsFile || false,
            }).returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('chatAi.model.create.success'),
                data: {
                    ...newModel,
                    description: newModel.description || undefined,
                    requiredTierId: newModel.requiredTierId || undefined,
                    createdAt: newModel.createdAt.toISOString(),
                    updatedAt: newModel.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default createModelAiRoute;
