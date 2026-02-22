import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionOptions } from '../../../../db/schema/exam/question-options.ts';
import { inArray } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const DeleteMultipleQuestionOptionsBody = Type.Object({
    ids: Type.Array(Type.String({ format: 'uuid' }), { minItems: 1 })
});

const DeleteMultipleQuestionOptionsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteMultipleQuestionOptionsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/deletes',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Question Options'],
            body: DeleteMultipleQuestionOptionsBody,
            response: {
                200: DeleteMultipleQuestionOptionsResponse,
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
            request: FastifyRequest<{ Body: typeof DeleteMultipleQuestionOptionsBody.static }>,
            reply: FastifyReply
        ) {
            const { ids } = request.body;

            // Perform Hard Delete for all provided IDs
            await db.delete(examQuestionOptions).where(inArray(examQuestionOptions.id, ids));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.question-options.delete.successMultiple'),
            });
        }),
    });
};

export default deleteMultipleQuestionOptionsRoute;
