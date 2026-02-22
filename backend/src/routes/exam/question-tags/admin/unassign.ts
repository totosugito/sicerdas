import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionTags } from '../../../../db/schema/exam/question-tags.ts';
import { and, inArray, eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const UnassignQuestionTagsBody = Type.Object({
    questionId: Type.String({ format: 'uuid' }),
    tagIds: Type.Array(Type.String({ format: 'uuid' }), { minItems: 1 })
});

const UnassignQuestionTagsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const unassignQuestionTagsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/unassign',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Question Tags'],
            body: UnassignQuestionTagsBody,
            response: {
                200: UnassignQuestionTagsResponse,
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
            request: FastifyRequest<{ Body: typeof UnassignQuestionTagsBody.static }>,
            reply: FastifyReply
        ) {
            const { questionId, tagIds } = request.body;

            await db.delete(examQuestionTags)
                .where(
                    and(
                        eq(examQuestionTags.questionId, questionId),
                        inArray(examQuestionTags.tagId, tagIds)
                    )
                );

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.question-tags.unassign.success'),
            });
        }),
    });
};

export default unassignQuestionTagsRoute;
