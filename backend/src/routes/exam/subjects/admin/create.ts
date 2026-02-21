import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examSubjects } from '../../../../db/schema/exam/subjects.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const CreateSubjectBody = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    isActive: Type.Optional(Type.Boolean({ default: true })),
});

const SubjectResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const CreateSubjectResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: SubjectResponseItem,
});

const createSubjectRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Subjects'],
            body: CreateSubjectBody,
            response: {
                201: CreateSubjectResponse,
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
            request: FastifyRequest<{ Body: typeof CreateSubjectBody.static }>,
            reply: FastifyReply
        ) {
            const { name, description, isActive } = request.body;

            // Check if name already exists
            const existingSubject = await db.query.examSubjects.findFirst({
                where: eq(examSubjects.name, name)
            });

            if (existingSubject) {
                return reply.badRequest(request.i18n.t('exam.subjects.create.exists'));
            }

            const [newSubject] = await db.insert(examSubjects).values({
                name,
                description,
                isActive: isActive !== undefined ? isActive : true,
            }).returning();

            return reply.status(201).send({
                success: true,
                message: request.i18n.t('exam.subjects.create.success'),
                data: {
                    ...newSubject,
                    createdAt: newSubject.createdAt.toISOString(),
                    updatedAt: newSubject.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default createSubjectRoute;
