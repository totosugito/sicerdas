import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPassages } from '../../../../db/schema/exam/passages.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const DeletePassageParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const DeletePassageResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deletePassageRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/delete/:id',
        method: 'DELETE',
        schema: {
            tags: ['Admin Exam Passages'],
            params: DeletePassageParams,
            response: {
                200: DeletePassageResponse,
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
            request: FastifyRequest<{ Params: typeof DeletePassageParams.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { id } = request.params;

            // Ensure passage exists
            const existingPassage = await db.query.examPassages.findFirst({
                where: eq(examPassages.id, id)
            });

            if (!existingPassage) {
                return reply.notFound(t($ => $.exam.passages.delete.notFound));
            }

            // Prevent deletion if passage is still attached to any questions
            const attachedQuestions = await db.query.examQuestions.findFirst({
                where: eq(examQuestions.passageId, id)
            });

            if (attachedQuestions) {
                return reply.badRequest(t($ => $.exam.passages.delete.hasChildren));
            }

            // Perform Hard Delete
            await db.delete(examPassages).where(eq(examPassages.id, id));

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.passages.delete.success),
            });
        }),
    });
};

export default deletePassageRoute;
