import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackageQuestions } from '../../../../db/schema/exam/package-questions.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { examPackageSections } from '../../../../db/schema/exam/package-sections.ts';
import { eq, and, sql } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const PackageQuestionListQuery = Type.Object({
    packageId: Type.String({ format: 'uuid' }),
    sectionId: Type.Optional(Type.String({ format: 'uuid' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const PackageQuestionListResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(Type.Object({
            packageId: Type.String({ format: 'uuid' }),
            sectionId: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
            questionId: Type.String({ format: 'uuid' }),
            order: Type.Number(),
            question: Type.Object({
                id: Type.String({ format: 'uuid' }),
                content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
                type: Type.String(),
            }),
            section: Type.Optional(Type.Object({
                id: Type.String({ format: 'uuid' }),
                title: Type.String(),
            })),
        })),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listPackageQuestionsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Package Questions'],
            body: PackageQuestionListQuery,
            response: {
                200: PackageQuestionListResponse,
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof PackageQuestionListQuery.static }>,
            reply: FastifyReply
        ) {
            const { packageId, sectionId, page = 1, limit = 10 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [eq(examPackageQuestions.packageId, packageId)];
            if (sectionId) conditions.push(eq(examPackageQuestions.sectionId, sectionId));

            const baseQuery = db.select({
                packageId: examPackageQuestions.packageId,
                sectionId: examPackageQuestions.sectionId,
                questionId: examPackageQuestions.questionId,
                order: examPackageQuestions.order,
                question: {
                    id: examQuestions.id,
                    content: examQuestions.content,
                    type: examQuestions.type,
                },
                section: {
                    id: examPackageSections.id,
                    title: examPackageSections.title,
                }
            })
                .from(examPackageQuestions)
                .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
                .leftJoin(examPackageSections, eq(examPackageQuestions.sectionId, examPackageSections.id))
                .where(and(...conditions))
                .orderBy(examPackageQuestions.order);

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(baseQuery.as('subquery'));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Execute Paginated Fetch
            const items = await baseQuery
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.package-questions.list.success'),
                data: {
                    items: items.map(item => ({
                        ...item,
                        section: item.section?.id ? item.section : undefined
                    })) as any,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages,
                    }
                }
            });
        }),
    });
};

export default listPackageQuestionsRoute;
