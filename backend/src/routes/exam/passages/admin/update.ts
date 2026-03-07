import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPassages } from '../../../../db/schema/exam/passages.ts';
import { examSubjects } from '../../../../db/schema/exam/subjects.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const UpdatePassageParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const UpdatePassageBody = Type.Object({
    title: Type.Optional(Type.Union([Type.String({ maxLength: 255 }), Type.Null()])),
    content: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
    isActive: Type.Optional(Type.Boolean()),
    subjectId: Type.Optional(Type.String({ format: 'uuid' })),
});

const PassageResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    title: Type.Union([Type.String(), Type.Null()]),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    subjectId: Type.String({ format: 'uuid' }),
});

const UpdatePassageResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: PassageResponseItem,
});

const updatePassageRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update/:id',
        method: 'PUT',
        schema: {
            tags: ['Admin Exam Passages'],
            params: UpdatePassageParams,
            body: UpdatePassageBody,
            response: {
                200: UpdatePassageResponse,
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
            request: FastifyRequest<{ Params: typeof UpdatePassageParams.static, Body: typeof UpdatePassageBody.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { id } = request.params;
            const { title, content, isActive, subjectId } = request.body;

            // Ensure passage exists
            const existingPassage = await db.query.examPassages.findFirst({
                where: eq(examPassages.id, id)
            });

            if (!existingPassage) {
                return reply.notFound(t($ => $.exam.passages.update.notFound));
            }

            // Build dynamic update payload
            const updatePayload: any = {
                updatedAt: new Date()
            };

            if (title !== undefined) updatePayload.title = title;
            if (content !== undefined) updatePayload.content = content;
            if (isActive !== undefined) updatePayload.isActive = isActive;

            if (subjectId !== undefined) {
                // Ensure subject exists
                const existingSubject = await db.query.examSubjects.findFirst({
                    where: eq(examSubjects.id, subjectId)
                });

                if (!existingSubject) {
                    return reply.notFound(t($ => $.exam.subjects.detail.notFound));
                }

                updatePayload.subjectId = subjectId;
            }

            const [updatedPassage] = await db.update(examPassages)
                .set(updatePayload)
                .where(eq(examPassages.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.passages.update.success),
                data: {
                    ...updatedPassage,
                    createdAt: updatedPassage.createdAt.toISOString(),
                    updatedAt: updatedPassage.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default updatePassageRoute;
