import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionSolutions } from '../../../../db/schema/exam/question-solutions.ts';
import { inArray } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const DeleteMultipleQuestionSolutionsBody = Type.Object({
    ids: Type.Array(Type.String({ format: 'uuid' }), { minItems: 1 })
});

const DeleteMultipleQuestionSolutionsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteMultipleQuestionSolutionsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/deletes',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Question Solutions'],
            body: DeleteMultipleQuestionSolutionsBody,
            response: {
                200: DeleteMultipleQuestionSolutionsResponse,
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
            request: FastifyRequest<{ Body: typeof DeleteMultipleQuestionSolutionsBody.static }>,
            reply: FastifyReply
        ) {
            const { ids } = request.body;

            // Perform Hard Delete for all provided IDs
            await db.delete(examQuestionSolutions).where(inArray(examQuestionSolutions.id, ids));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.question-solutions.delete.successMultiple'),
            });
        }),
    });
};

export default deleteMultipleQuestionSolutionsRoute;
