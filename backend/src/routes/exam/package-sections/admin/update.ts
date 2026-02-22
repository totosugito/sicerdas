import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackageSections } from '../../../../db/schema/exam/package-sections.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const UpdateSectionParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const UpdateSectionBody = Type.Object({
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    durationMinutes: Type.Optional(Type.Number({ minimum: 1 })),
    order: Type.Optional(Type.Number()),
    isActive: Type.Optional(Type.Boolean()),
});

const UpdateSectionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const updateSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update/:id',
        method: 'PUT',
        schema: {
            tags: ['Admin Exam Package Sections'],
            params: UpdateSectionParams,
            body: UpdateSectionBody,
            response: {
                200: UpdateSectionResponse,
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof UpdateSectionParams.static, Body: typeof UpdateSectionBody.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const body = request.body;

            const [existing] = await db.select({ id: examPackageSections.id })
                .from(examPackageSections)
                .where(eq(examPackageSections.id, id))
                .limit(1);

            if (!existing) {
                return reply.status(404).send({
                    success: false,
                    message: request.i18n.t('exam.package-sections.update.notFound'),
                });
            }

            await db.update(examPackageSections)
                .set({
                    ...body,
                    updatedAt: new Date(),
                })
                .where(eq(examPackageSections.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.package-sections.update.success'),
            });
        }),
    });
};

export default updateSectionRoute;
