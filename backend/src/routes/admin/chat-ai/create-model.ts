import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { aiModels } from "../../../db/schema/chat-ai-schema.ts";
import { EnumUserTier } from "../../../db/schema/enum-app.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

const CreateModelBody = Type.Object({
    name: Type.String(),
    provider: Type.String(),
    modelIdentifier: Type.String(),
    description: Type.Optional(Type.String()),
    maxTokens: Type.Optional(Type.Number()),
    supportsImage: Type.Optional(Type.Boolean({ default: false })),
    supportsFile: Type.Optional(Type.Boolean({ default: false })),
    acceptedImageExtensions: Type.Optional(Type.Array(Type.String(), { default: ['.jpg', '.jpeg', '.png', '.webp'] })),
    acceptedFileExtensions: Type.Optional(Type.Array(Type.String(), { default: ['.pdf', '.txt'] })),
    maxFileSize: Type.Optional(Type.Number()),
    status: Type.Enum(EnumUserTier, { default: EnumUserTier.FREE }),
    isEnabled: Type.Optional(Type.Boolean({ default: true })),
    isDefault: Type.Optional(Type.Boolean({ default: false })),
});

const CreateModelResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        id: Type.String({ format: 'uuid' }),
    }),
});

const createModelRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/models',
        method: 'POST',
        schema: {
            tags: ['Admin/ChatAI'],
            summary: 'Create AI model',
            body: CreateModelBody,
            response: {
                201: CreateModelResponse,
                '4xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                }),
                '5xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                })
            },
        },
        handler: withErrorHandler(async function handler(
            req: FastifyRequest<{ Body: typeof CreateModelBody.static }>,
            reply: FastifyReply
        ): Promise<typeof CreateModelResponse.static> {
            const [newModel] = await db
                .insert(aiModels)
                .values({
                    ...req.body,
                })
                .returning({ id: aiModels.id });

            return reply.code(201).send({
                success: true,
                message: req.i18n.t('chat-ai.admin.model.create.success'),
                data: newModel,
            });
        }),
    });
};

export default createModelRoute;
