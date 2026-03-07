import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionOptions } from '../../../../db/schema/exam/question-options.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const DeleteQuestionOptionParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const DeleteQuestionOptionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/delete/:id',
        method: 'DELETE',
        schema: {
            tags: ['Admin Exam Question Options'],
            params: DeleteQuestionOptionParams,
            response: {
                200: DeleteQuestionOptionResponse,
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
            request: FastifyRequest<{ Params: typeof DeleteQuestionOptionParams.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { id } = request.params;

            // Ensure option exists
            const existingOption = await db.query.examQuestionOptions.findFirst({
                where: eq(examQuestionOptions.id, id)
            });

            if (!existingOption) {
                return reply.notFound(t($ => $.exam.question_options.delete.notFound));
            }

            // Perform Hard Delete
            await db.delete(examQuestionOptions).where(eq(examQuestionOptions.id, id));

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.question_options.delete.success),
            });
        }),
    });
};

export default deleteQuestionOptionRoute;
