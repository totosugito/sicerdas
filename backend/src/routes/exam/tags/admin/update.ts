import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examTags } from '../../../../db/schema/exam/tags.ts';
import { eq, and, ne } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const UpdateTagParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const UpdateTagBody = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    isActive: Type.Optional(Type.Boolean()),
});

const TagResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const UpdateTagResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: TagResponseItem,
});

const updateTagRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update/:id',
        method: 'PUT',
        schema: {
            tags: ['Admin Exam Tags'],
            params: UpdateTagParams,
            body: UpdateTagBody,
            response: {
                200: UpdateTagResponse,
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
            request: FastifyRequest<{ Params: typeof UpdateTagParams.static, Body: typeof UpdateTagBody.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const { name, description, isActive } = request.body;

            // Ensure tag exists
            const existingTag = await db.query.examTags.findFirst({
                where: eq(examTags.id, id)
            });

            if (!existingTag) {
                return reply.notFound(request.i18n.t('exam.tags.update.notFound'));
            }

            // Check if new name conflicts with another existing tag
            const nameConflict = await db.query.examTags.findFirst({
                where: and(
                    eq(examTags.name, name),
                    ne(examTags.id, id)
                )
            });

            if (nameConflict) {
                return reply.badRequest(request.i18n.t('exam.tags.update.exists'));
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

            const [updatedTag] = await db.update(examTags)
                .set(updatePayload)
                .where(eq(examTags.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.tags.update.success'),
                data: {
                    ...updatedTag,
                    createdAt: updatedTag.createdAt.toISOString(),
                    updatedAt: updatedTag.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default updateTagRoute;
