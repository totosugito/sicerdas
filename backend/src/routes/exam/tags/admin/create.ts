import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examTags } from '../../../../db/schema/exam/tags.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const CreateTagBody = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    isActive: Type.Optional(Type.Boolean({ default: true })),
});

const TagResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const CreateTagResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: TagResponseItem,
});

const createTagRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Tags'],
            body: CreateTagBody,
            response: {
                201: CreateTagResponse,
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
            request: FastifyRequest<{ Body: typeof CreateTagBody.static }>,
            reply: FastifyReply
        ) {
            const { name, description, isActive } = request.body;

            // Check if name already exists
            const existingTag = await db.query.examTags.findFirst({
                where: eq(examTags.name, name)
            });

            if (existingTag) {
                return reply.badRequest(request.i18n.t('exam.tags.create.exists'));
            }

            const [newTag] = await db.insert(examTags).values({
                name,
                description,
                isActive: isActive !== undefined ? isActive : true,
            }).returning();

            return reply.status(201).send({
                success: true,
                message: request.i18n.t('exam.tags.create.success'),
                data: {
                    ...newTag,
                    createdAt: newTag.createdAt.toISOString(),
                    updatedAt: newTag.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default createTagRoute;
