import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { EnumExamType } from '../../../../db/schema/exam/enums.ts';

const CreatePackageBody = Type.Object({
    categoryId: Type.String({ format: 'uuid' }),
    title: Type.String({ minLength: 1, maxLength: 255 }),
    examType: Type.Enum(EnumExamType, { default: EnumExamType.OFFICIAL }),
    durationMinutes: Type.Number({ minimum: 1, default: 120 }),
    description: Type.Optional(Type.String()),
    requiredTier: Type.Optional(Type.String({ default: 'free' })),
    educationGradeId: Type.Optional(Type.Number()),
    isActive: Type.Optional(Type.Boolean({ default: true })),
});

const CreatePackageResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        id: Type.String({ format: 'uuid' }),
    }),
});

const createPackageRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Packages'],
            body: CreatePackageBody,
            response: {
                201: CreatePackageResponse,
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
            request: FastifyRequest<{ Body: typeof CreatePackageBody.static }>,
            reply: FastifyReply
        ) {
            const body = request.body;

            const [newPackage] = await db.insert(examPackages)
                .values({
                    categoryId: body.categoryId,
                    title: body.title,
                    examType: body.examType,
                    durationMinutes: body.durationMinutes,
                    description: body.description,
                    requiredTier: body.requiredTier,
                    educationGradeId: body.educationGradeId,
                    isActive: body.isActive,
                })
                .returning({ id: examPackages.id });

            return reply.status(201).send({
                success: true,
                message: request.i18n.t('exam.packages.create.success'),
                data: {
                    id: newPackage.id,
                },
            });
        }),
    });
};

export default createPackageRoute;
