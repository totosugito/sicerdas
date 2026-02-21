import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examSubjects } from '../../../../db/schema/exam/subjects.ts';
import { eq, and, ne } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const UpdateSubjectParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const UpdateSubjectBody = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    isActive: Type.Optional(Type.Boolean()),
});

const SubjectResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const UpdateSubjectResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: SubjectResponseItem,
});

const updateSubjectRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update/:id',
        method: 'PUT',
        schema: {
            tags: ['Admin Exam Subjects'],
            params: UpdateSubjectParams,
            body: UpdateSubjectBody,
            response: {
                200: UpdateSubjectResponse,
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
            request: FastifyRequest<{ Params: typeof UpdateSubjectParams.static, Body: typeof UpdateSubjectBody.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const { name, description, isActive } = request.body;

            // Ensure subject exists
            const existingSubject = await db.query.examSubjects.findFirst({
                where: eq(examSubjects.id, id)
            });

            if (!existingSubject) {
                return reply.notFound(request.i18n.t('exam.subjects.update.notFound'));
            }

            // Check if new name conflicts with another existing subject
            const nameConflict = await db.query.examSubjects.findFirst({
                where: and(
                    eq(examSubjects.name, name),
                    ne(examSubjects.id, id)
                )
            });

            if (nameConflict) {
                return reply.badRequest(request.i18n.t('exam.subjects.update.exists'));
            }

            // Build dynamic update payload
            const updatePayload: any = {
                name,
                description,
                updatedAt: new Date()
            };

            if (isActive !== undefined) {
                updatePayload.isActive = isActive;
            }

            const [updatedSubject] = await db.update(examSubjects)
                .set(updatePayload)
                .where(eq(examSubjects.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.subjects.update.success'),
                data: {
                    ...updatedSubject,
                    createdAt: updatedSubject.createdAt.toISOString(),
                    updatedAt: updatedSubject.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default updateSubjectRoute;
