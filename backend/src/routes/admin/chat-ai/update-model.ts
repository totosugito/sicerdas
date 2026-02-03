import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { aiModels } from "../../../db/schema/chat-ai-schema.ts";
import { EnumUserTier } from "../../../db/schema/enum-app.ts";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const UpdateModelParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

// Partial of create body
const UpdateModelBody = Type.Object({
    name: Type.Optional(Type.String()),
    provider: Type.Optional(Type.String()),
    modelIdentifier: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    maxTokens: Type.Optional(Type.Number()),
    supportsImage: Type.Optional(Type.Boolean()),
    supportsFile: Type.Optional(Type.Boolean()),
    acceptedImageExtensions: Type.Optional(Type.Array(Type.String())),
    acceptedFileExtensions: Type.Optional(Type.Array(Type.String())),
    maxFileSize: Type.Optional(Type.Number()),
    status: Type.Optional(Type.Enum(EnumUserTier)),
    isEnabled: Type.Optional(Type.Boolean()),
    isDefault: Type.Optional(Type.Boolean()),
});

const UpdateModelResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        id: Type.String({ format: 'uuid' }),
    }),
});

const updateModelRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/models/:id',
        method: 'PATCH',
        schema: {
            tags: ['Admin/ChatAI'],
            summary: 'Update AI model',
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
            },
        },
        handler: withErrorHandler(async function handler(
            req: FastifyRequest<{ Params: typeof UpdateModelParams.static; Body: typeof UpdateModelBody.static }>,
            reply: FastifyReply
        ): Promise<typeof UpdateModelResponse.static> {
            const { id } = req.params;

            const [updatedModel] = await db
                .update(aiModels)
                .set({
                    ...req.body,
                    updatedAt: new Date(),
                })
                .where(eq(aiModels.id, id))
                .returning({ id: aiModels.id });

            if (!updatedModel) {
                return reply.notFound(req.i18n.t('admin.model.update.notFound'));
            }

            return reply.send({
                success: true,
                message: req.i18n.t('admin.model.update.success'),
                data: updatedModel,
            });
        }),
    });
};

export default updateModelRoute;
