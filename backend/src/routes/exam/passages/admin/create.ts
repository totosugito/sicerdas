import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPassages } from '../../../../db/schema/exam/passages.ts';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const CreatePassageBody = Type.Object({
    title: Type.Optional(Type.String({ maxLength: 255 })), // Optional internal title
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())), // BlockNote JSON format
    isActive: Type.Optional(Type.Boolean({ default: true }))
});

const PassageResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    title: Type.Union([Type.String(), Type.Null()]),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const CreatePassageResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: PassageResponseItem,
});

const createPassageRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Passages'],
            body: CreatePassageBody,
            response: {
                201: CreatePassageResponse,
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
            request: FastifyRequest<{ Body: typeof CreatePassageBody.static }>,
            reply: FastifyReply
        ) {
            const { title, content, isActive } = request.body;

            const [newPassage] = await db.insert(examPassages).values({
                title: title || null,
                content,
                isActive: isActive !== undefined ? isActive : true,
            }).returning();

            return reply.status(201).send({
                success: true,
                message: request.i18n.t('exam.passages.create.success'),
                data: {
                    ...newPassage,
                    createdAt: newPassage.createdAt.toISOString(),
                    updatedAt: newPassage.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default createPassageRoute;
