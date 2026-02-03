import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { aiModels } from "../../../db/schema/chat-ai-schema.ts";
import { inArray } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const DeleteMultipleModelsBody = Type.Object({
    ids: Type.Array(Type.String({ format: 'uuid' })),
});

const DeleteMultipleModelsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(Type.Object({
        id: Type.String({ format: 'uuid' }),
    })),
});

const deleteMultipleModelsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/models/delete-batch',
        method: 'DELETE',
        schema: {
            tags: ['Admin/ChatAI'],
            summary: 'Delete multiple AI models',
            body: DeleteMultipleModelsBody,
            response: {
                200: DeleteMultipleModelsResponse,
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
            req: FastifyRequest<{ Body: typeof DeleteMultipleModelsBody.static }>,
            reply: FastifyReply
        ): Promise<typeof DeleteMultipleModelsResponse.static> {
            const { ids } = req.body;

            if (ids.length === 0) {
                return reply.badRequest(req.i18n.t('admin.model.deleteBatch.emptyIds'));
            }

            const deletedModels = await db
                .delete(aiModels)
                .where(inArray(aiModels.id, ids))
                .returning({
                    id: aiModels.id
                });

            return reply.send({
                success: true,
                message: req.i18n.t('admin.model.deleteBatch.success'),
                data: deletedModels,
            });
        }),
    });
};

export default deleteMultipleModelsRoute;
