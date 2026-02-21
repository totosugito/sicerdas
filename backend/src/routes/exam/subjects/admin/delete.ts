import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examSubjects } from '../../../../db/schema/exam/subjects.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const DeleteSubjectParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const DeleteSubjectResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteSubjectRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/delete/:id',
        method: 'DELETE',
        schema: {
            tags: ['Admin Exam Subjects'],
            params: DeleteSubjectParams,
            response: {
                200: DeleteSubjectResponse,
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
            request: FastifyRequest<{ Params: typeof DeleteSubjectParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            // Ensure subject exists
            const existingSubject = await db.query.examSubjects.findFirst({
                where: eq(examSubjects.id, id)
            });

            if (!existingSubject) {
                return reply.notFound(request.i18n.t('exam.subjects.delete.notFound'));
            }

            // Optional Check: Is this subject in use by any exam questions?
            // If it is, the foreign key constraint will block the hard delete.
            const inUseCheck = await db.query.examQuestions.findFirst({
                where: eq(examQuestions.subjectId, id)
            });

            if (inUseCheck) {
                // Return a friendly error using Sensible, instead of raw pg constraint error
                return reply.badRequest('Mata pelajaran ini tidak dapat dihapus karena masih terikat pada beberapa soal ujian.');
            }

            // Perform Hard Delete
            await db.delete(examSubjects).where(eq(examSubjects.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.subjects.delete.success'),
            });
        }),
    });
};

export default deleteSubjectRoute;
