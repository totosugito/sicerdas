import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { educationCategories } from '../../../../db/schema/education/categories.ts';
import { educationGrades } from '../../../../db/schema/education/grades.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { EnumExamType } from '../../../../db/schema/exam/enums.ts';

const UpdatePackageParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const UpdatePackageBody = Type.Object({
    categoryId: Type.Optional(Type.String({ format: 'uuid' })),
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    examType: Type.Optional(Type.Enum(EnumExamType)),
    durationMinutes: Type.Optional(Type.Number({ minimum: 0 })),
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
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof UpdatePackageParams.static, Body: typeof UpdatePackageBody.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { id } = request.params;
            const {
                categoryId, title, examType, durationMinutes,
                description, requiredTier, educationGradeId, isActive
            } = request.body;

            const existing = await db.query.examPackages.findFirst({
                where: eq(examPackages.id, id)
            });

            if (!existing) {
                return reply.notFound(t($ => $.exam.packages.update.notFound));
            }

            // 1. Check if category exists if provided
            if (categoryId) {
                const existingCategory = await db.query.educationCategories.findFirst({
                    where: eq(educationCategories.id, categoryId)
                });

                if (!existingCategory) {
                    return reply.notFound(t($ => $.education.categories.update.notFound));
                }
            }

            // 2. Check if education grade exists if provided
            if (educationGradeId) {
                const existingGrade = await db.query.educationGrades.findFirst({
                    where: eq(educationGrades.id, educationGradeId)
                });

                if (!existingGrade) {
                    return reply.notFound(t($ => $.education.grades.update.notFound));
                }
            }

            await db.update(examPackages)
                .set({
                    categoryId,
                    title,
                    examType,
                    durationMinutes,
                    description,
                    requiredTier,
                    educationGradeId,
                    isActive,
                    updatedAt: new Date(),
                })
                .where(eq(examPackages.id, id));

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.packages.update.success),
            });
        }),
    });
};

export default updatePackageRoute;
