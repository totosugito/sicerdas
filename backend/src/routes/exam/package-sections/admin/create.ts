import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackageSections } from '../../../../db/schema/exam/package-sections.ts';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const CreateSectionBody = Type.Object({
    packageId: Type.String({ format: 'uuid' }),
    title: Type.String({ minLength: 1, maxLength: 255 }),
    durationMinutes: Type.Optional(Type.Number({ minimum: 1 })),
    order: Type.Optional(Type.Number({ default: 1 })),
    isActive: Type.Optional(Type.Boolean({ default: true })),
});

const CreateSectionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        id: Type.String({ format: 'uuid' }),
    }),
});

const createSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Package Sections'],
            body: CreateSectionBody,
            response: {
                201: CreateSectionResponse,
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof CreateSectionBody.static }>,
            reply: FastifyReply
        ) {
            const body = request.body;

            const [newSection] = await db.insert(examPackageSections)
                .values({
                    packageId: body.packageId,
                    title: body.title,
                    durationMinutes: body.durationMinutes,
                    order: body.order,
                    isActive: body.isActive,
                })
                .returning({ id: examPackageSections.id });

            return reply.status(201).send({
                success: true,
                message: request.i18n.t('exam.package-sections.create.success'),
                data: {
                    id: newSection.id,
                },
            });
        }),
    });
};

export default createSectionRoute;
