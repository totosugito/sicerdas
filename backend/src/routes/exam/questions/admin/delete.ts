import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const DeleteQuestionParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const DeleteQuestionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/delete/:id',
        method: 'DELETE',
        schema: {
            tags: ['Admin Exam Questions'],
            params: DeleteQuestionParams,
            response: {
                200: DeleteQuestionResponse,
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
            request: FastifyRequest<{ Params: typeof DeleteQuestionParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            // Ensure question exists
            const existingQuestion = await db.query.examQuestions.findFirst({
                where: eq(examQuestions.id, id)
            });

            if (!existingQuestion) {
                return reply.notFound(request.i18n.t('exam.questions.delete.notFound'));
            }

            // Perform Hard Delete. The database schema has `onDelete: 'cascade'` for options 
            // and solutions, so they will be automatically deleted by PostgreSQL.
            await db.delete(examQuestions).where(eq(examQuestions.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.questions.delete.success'),
            });
        }),
    });
};

export default deleteQuestionRoute;
