import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionTags } from '../../../../db/schema/exam/question-tags.ts';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const AssignQuestionTagsBody = Type.Object({
    questionId: Type.String({ format: 'uuid' }),
    tagIds: Type.Array(Type.String({ format: 'uuid' }), { minItems: 1 })
});

const AssignQuestionTagsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const assignQuestionTagsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/assign',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Question Tags'],
            body: AssignQuestionTagsBody,
            response: {
                200: AssignQuestionTagsResponse,
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
            request: FastifyRequest<{ Body: typeof AssignQuestionTagsBody.static }>,
            reply: FastifyReply
        ) {
            const { questionId, tagIds } = request.body;

            // Use ON CONFLICT DO NOTHING to avoid duplicate key errors
            const values = tagIds.map(tagId => ({
                questionId,
                tagId
            }));

            await db.insert(examQuestionTags)
                .values(values)
                .onConflictDoNothing();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.question-tags.assign.success'),
            });
        }),
    });
};

export default assignQuestionTagsRoute;
