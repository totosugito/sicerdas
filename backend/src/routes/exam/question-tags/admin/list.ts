import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionTags } from '../../../../db/schema/exam/question-tags.ts';
import { examTags } from '../../../../db/schema/exam/tags.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const QuestionTagListQuery = Type.Object({
    questionId: Type.Optional(Type.String({ format: 'uuid' })),
    tagId: Type.Optional(Type.String({ format: 'uuid' })),
});

const QuestionTagListResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(Type.Object({
        questionId: Type.String({ format: 'uuid' }),
        tagId: Type.String({ format: 'uuid' }),
        // Optionally include joined data
        tag: Type.Optional(Type.Object({
            id: Type.String({ format: 'uuid' }),
            name: Type.String(),
        })),
        question: Type.Optional(Type.Object({
            id: Type.String({ format: 'uuid' }),
            // title omitted as questions don't have varchar titles, usually identified by ID in junction lists
        }))
    }))
});

const listQuestionTagsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Question Tags'],
            body: QuestionTagListQuery,
            response: {
                200: QuestionTagListResponse,
                '4xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                })
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof QuestionTagListQuery.static }>,
            reply: FastifyReply
        ) {
            const { questionId, tagId } = request.body;

            let query = db.select({
                questionId: examQuestionTags.questionId,
                tagId: examQuestionTags.tagId,
                tag: {
                    id: examTags.id,
                    name: examTags.name
                }
            })
                .from(examQuestionTags)
                .leftJoin(examTags, eq(examQuestionTags.tagId, examTags.id));

            if (questionId) {
                query = query.where(eq(examQuestionTags.questionId, questionId)) as any;
            } else if (tagId) {
                query = query.where(eq(examQuestionTags.tagId, tagId)) as any;
            }

            const items = await query;

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.question-tags.list.success'),
                data: items.map(item => ({
                    questionId: item.questionId,
                    tagId: item.tagId,
                    tag: item.tag ? { id: item.tag.id, name: item.tag.name } : undefined
                })) as any
            });
        }),
    });
};

export default listQuestionTagsRoute;
