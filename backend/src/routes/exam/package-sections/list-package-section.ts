import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { examPackageSections } from '../../../db/schema/exam/package-sections.ts';
import { examPackageQuestions } from '../../../db/schema/exam/package-questions.ts';
import { examPackages } from '../../../db/schema/exam/packages.ts';
import { and, eq, sql, desc } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { fromNodeHeaders } from 'better-auth/node';
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumUserRole } from '../../../db/schema/index.ts';

const SectionListQuery = Type.Object({
    packageId: Type.Optional(Type.String({ format: 'uuid' })),
    isActive: Type.Optional(Type.Boolean()),
    sortBy: Type.Optional(Type.String({ description: 'Sort field: createdAt, title, isActive, updatedAt, durationMinutes, order', default: 'order' })),
    sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'asc' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const SectionResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    packageId: Type.String({ format: 'uuid' }),
    packageName: Type.Union([Type.String(), Type.Null()]),
    title: Type.String(),
    durationMinutes: Type.Union([Type.Number(), Type.Null()]),
    order: Type.Number(),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    totalQuestions: Type.Number(),
});

const ListSectionsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        package: Type.Object({
            packageId: Type.String(),
            packageName: Type.String(),
        }),
        items: Type.Array(SectionResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listSectionsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Package Sections'],
            body: SectionListQuery,
            response: {
                200: ListSectionsResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof SectionListQuery.static }>,
            reply: FastifyReply
        ) {
            // Determine user role from session
            const session = await getAuthInstance(app).api.getSession({
                headers: fromNodeHeaders(request.headers),
            });
            const user = session?.user;
            const isAdmin = user?.role === EnumUserRole.ADMIN;

            const {
                packageId, isActive,
                sortOrder = 'asc', page = 1, limit = 10
            } = request.body;

            let { sortBy = 'order' } = request.body;

            const offset = (page - 1) * limit;

            let returnPackageId = "";
            let returnPackageName = "";

            const conditions: any[] = [];

            if (packageId) {
                const [existingPackage] = await db.select({ id: examPackages.id, title: examPackages.title })
                    .from(examPackages)
                    .where(eq(examPackages.id, packageId))
                    .limit(1);

                if (!existingPackage) {
                    return reply.notFound(request.i18n.t('exam.packages.detail.notFound'));
                }

                returnPackageId = existingPackage.id;
                returnPackageName = existingPackage.title;

                conditions.push(eq(examPackageSections.packageId, packageId));
            }

            if (!isAdmin) {
                // Client must only see active sections
                conditions.push(eq(examPackageSections.isActive, true));
                // Force sorting ignoring isActive for clients
                if (sortBy === 'isActive') sortBy = 'order';
            } else {
                // Admin can filter by active status
                if (isActive !== undefined) conditions.push(eq(examPackageSections.isActive, isActive));
            }

            let baseQuery = db.select({
                section: examPackageSections,
                packageName: examPackages.title,
                totalQuestions: sql<number>`count(${examPackageQuestions.questionId})::int`
            })
                .from(examPackageSections)
                .leftJoin(examPackages, eq(examPackageSections.packageId, examPackages.id))
                .leftJoin(examPackageQuestions, eq(examPackageSections.id, examPackageQuestions.sectionId))
                .groupBy(examPackageSections.id, examPackages.id);

            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Sorting
            const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'isActive':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackageSections.isActive) : baseQuery.orderBy(desc(examPackageSections.isActive));
                    break;
                case 'updatedAt':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackageSections.updatedAt) : baseQuery.orderBy(desc(examPackageSections.updatedAt));
                    break;
                case 'durationMinutes':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackageSections.durationMinutes) : baseQuery.orderBy(desc(examPackageSections.durationMinutes));
                    break;
                case 'createdAt':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackageSections.createdAt) : baseQuery.orderBy(desc(examPackageSections.createdAt));
                    break;
                case 'title':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackageSections.title) : baseQuery.orderBy(desc(examPackageSections.title));
                    break;
                case 'order':
                default:
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackageSections.order) : baseQuery.orderBy(desc(examPackageSections.order));
                    break;
            }

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(queryWithSort.as('subquery'));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await queryWithSort
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.package-sections.list.success'),
                data: {
                    package: {
                        packageId: returnPackageId,
                        packageName: returnPackageName,
                    },
                    items: items.map(r => {
                        const s = r.section;
                        return {
                            ...s,
                            packageName: r.packageName,
                            totalQuestions: Number(r.totalQuestions),
                            createdAt: s.createdAt.toISOString(),
                            updatedAt: s.updatedAt.toISOString(),
                        };
                    }),
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

export default listSectionsRoute;
