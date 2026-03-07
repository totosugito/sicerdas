import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { educationCategories } from '../../../../db/schema/education/categories.ts';
import { educationGrades } from '../../../../db/schema/education/grades.ts';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { EnumExamType } from '../../../../db/schema/exam/enums.ts';
import { fromNodeHeaders } from 'better-auth/node';
import { getAuthInstance } from "../../../../decorators/auth.decorator.ts";
import { eq } from 'drizzle-orm';

const CreatePackageBody = Type.Object({
    categoryId: Type.String({ format: 'uuid' }),
    title: Type.String({ minLength: 1, maxLength: 255 }),
    examType: Type.Enum(EnumExamType, { default: EnumExamType.OFFICIAL }),
    durationMinutes: Type.Number({ minimum: 0, default: 0 }),
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
            const {
                categoryId, title, examType, durationMinutes,
                description, requiredTier, educationGradeId, isActive
            } = request.body;

            // 1. Check if category exists
            const existingCategory = await db.query.educationCategories.findFirst({
                where: eq(educationCategories.id, categoryId)
            });

            if (!existingCategory) {
                return reply.notFound(request.i18n.t('exam.categories.update.notFound'));
            }

            // 2. Check if education grade exists (if provided)
            if (educationGradeId) {
                const existingGrade = await db.query.educationGrades.findFirst({
                    where: eq(educationGrades.id, educationGradeId)
                });

                if (!existingGrade) {
                    return reply.notFound(request.i18n.t('education.grade.notFound'));
                }
            }

            const session = await getAuthInstance(app).api.getSession({
                headers: fromNodeHeaders(request.headers),
            });
            const user = session?.user;

            const [newPackage] = await db.insert(examPackages)
                .values({
                    categoryId,
                    title,
                    examType,
                    durationMinutes,
                    description,
                    requiredTier,
                    educationGradeId,
                    isActive: isActive ?? true,
                    createdByUserId: user?.id,
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
