import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { aiModels } from "../../../db/schema/chat-ai-schema.ts";
import { inArray } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const UpdateMultipleModelsBody = Type.Object({
    ids: Type.Array(Type.String({ format: 'uuid' })),
    isEnabled: Type.Optional(Type.Boolean()),
    apiKey: Type.Optional(Type.String()),
});

const UpdateMultipleModelsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(Type.Object({
        id: Type.String({ format: 'uuid' }),
        isEnabled: Type.Boolean(),
    })),
});

const updateMultipleModelsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/models/update-batch',
        method: 'PATCH',
        schema: {
            tags: ['Admin/ChatAI'],
            summary: 'Update multiple AI models status',
            body: UpdateMultipleModelsBody,
            response: {
                200: UpdateMultipleModelsResponse,
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
            req: FastifyRequest<{ Body: typeof UpdateMultipleModelsBody.static }>,
            reply: FastifyReply
        ): Promise<typeof UpdateMultipleModelsResponse.static> {
            const { ids, isEnabled, apiKey } = req.body;

            if (ids.length === 0) {
                return reply.badRequest(req.i18n.t('admin.model.updateBatch.emptyIds'));
            }

            if (isEnabled === undefined && apiKey === undefined) {
                return reply.badRequest(req.i18n.t('admin.model.updateBatch.noFieldsToUpdate'));
            }

            const updateData: any = {
                updatedAt: new Date(),
            };

            if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
            if (apiKey !== undefined) updateData.apiKey = apiKey;

            const updatedModels = await db
                .update(aiModels)
                .set(updateData)
                .where(inArray(aiModels.id, ids))
                .returning({
                    id: aiModels.id,
                    isEnabled: aiModels.isEnabled
                });

            return reply.send({
                success: true,
                message: req.i18n.t('admin.model.updateBatch.success'),
                data: updatedModels,
            });
        }),
    });
};

export default updateMultipleModelsRoute;
