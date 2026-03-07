import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { educationTags } from '../../../../db/schema/education/tags.ts';
import { eq, and, ne } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

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
            const { t } = getTypedI18n(request);
            const { id } = request.params;
            const { name, description, isActive } = request.body;

            // Ensure tag exists
            const existingTag = await db.query.educationTags.findFirst({
                where: eq(educationTags.id, id)
            });

            if (!existingTag) {
                return reply.notFound(t($ => $.education.tags.update.notFound));
            }

            // Check if new name conflicts with another existing tag
            const nameConflict = await db.query.educationTags.findFirst({
                where: and(
                    eq(educationTags.name, name),
                    ne(educationTags.id, id)
                )
            });

            if (nameConflict) {
                return reply.badRequest(t($ => $.education.tags.update.exists));
            }

            const [updatedTag] = await db.update(educationTags)
                .set({
                    name,
                    description,
                    isActive,
                    updatedAt: new Date()
                })
                .where(eq(educationTags.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: t($ => $.education.tags.update.success),
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
