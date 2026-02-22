import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { EnumExamType } from '../../../../db/schema/exam/enums.ts';

const UpdatePackageParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const UpdatePackageBody = Type.Object({
    categoryId: Type.Optional(Type.String({ format: 'uuid' })),
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    examType: Type.Optional(Type.Enum(EnumExamType)),
    durationMinutes: Type.Optional(Type.Number({ minimum: 1 })),
    description: Type.Optional(Type.String()),
    requiredTier: Type.Optional(Type.String()),
    educationGradeId: Type.Optional(Type.Number()),
    isActive: Type.Optional(Type.Boolean()),
});

const UpdatePackageResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const updatePackageRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update/:id',
        method: 'PUT',
        schema: {
            tags: ['Admin Exam Packages'],
            params: UpdatePackageParams,
            body: UpdatePackageBody,
            response: {
                200: UpdatePackageResponse,
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof UpdatePackageParams.static, Body: typeof UpdatePackageBody.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const body = request.body;

            const [existing] = await db.select({ id: examPackages.id })
                .from(examPackages)
                .where(eq(examPackages.id, id))
                .limit(1);

            if (!existing) {
                return reply.status(404).send({
                    success: false,
                    message: request.i18n.t('exam.packages.update.notFound'),
                });
            }

            await db.update(examPackages)
                .set({
                    ...body,
                    updatedAt: new Date(),
                })
                .where(eq(examPackages.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.packages.update.success'),
            });
        }),
    });
};

export default updatePackageRoute;
