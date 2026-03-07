import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { educationTags } from '../../../../db/schema/education/tags.ts';
import { examQuestionTags } from '../../../../db/schema/exam/question-tags.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const DeleteTagParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const DeleteTagResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteTagRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/delete/:id',
        method: 'DELETE',
        schema: {
            tags: ['Admin Exam Tags'],
            params: DeleteTagParams,
            response: {
                200: DeleteTagResponse,
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
            request: FastifyRequest<{ Params: typeof DeleteTagParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            // Ensure tag exists
            const existingTag = await db.query.educationTags.findFirst({
                where: eq(educationTags.id, id)
            });

            if (!existingTag) {
                return reply.notFound(request.i18n.t('education.tags.delete.notFound'));
            }

            // Optional Check: Is this tag in use by any exam questions?
            // If it is, the foreign key constraint will block the hard delete in `exam_question_tags`.
            const inUseCheck = await db.query.examQuestionTags.findFirst({
                where: eq(examQuestionTags.tagId, id)
            });

            if (inUseCheck) {
                // Return a friendly error using Sensible, instead of raw pg constraint error
                return reply.badRequest(request.i18n.t('education.tags.delete.inUse'));
            }

            // Perform Hard Delete
            await db.delete(educationTags).where(eq(educationTags.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('education.tags.delete.success'),
            });
        }),
    });
};

export default deleteTagRoute;
