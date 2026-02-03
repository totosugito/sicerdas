import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { aiModels } from "../../../db/schema/chat-ai-schema.ts";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const DeleteModelParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const DeleteModelResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        id: Type.String({ format: 'uuid' }),
    }),
});

const deleteModelRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/models/:id',
        method: 'DELETE',
        schema: {
            tags: ['Admin/ChatAI'],
            summary: 'Delete AI model',
            params: DeleteModelParams,
            response: {
                200: DeleteModelResponse,
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
            req: FastifyRequest<{ Params: typeof DeleteModelParams.static }>,
            reply: FastifyReply
        ): Promise<typeof DeleteModelResponse.static> {
            const { id } = req.params;

            const [deletedModel] = await db
                .delete(aiModels)
                .where(eq(aiModels.id, id))
                .returning({ id: aiModels.id });

            if (!deletedModel) {
                return reply.notFound(req.i18n.t('admin.model.delete.notFound'));
            }

            return reply.send({
                success: true,
                message: req.i18n.t('admin.model.delete.success'),
                data: deletedModel,
            });
        }),
    });
};

export default deleteModelRoute;
