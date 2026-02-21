import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examSubjects } from '../../../../db/schema/exam/subjects.ts';
import { desc, ilike, or, and, sql, eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const SubjectListQuery = Type.Object({
    search: Type.Optional(Type.String({ description: 'Search term for subject name or description' })),
    isActive: Type.Optional(Type.Boolean({ description: 'Filter by active status. Omit to fetch all.' })),
    sortBy: Type.Optional(Type.String({ description: 'Sort field: createdAt, name', default: 'createdAt' })),
    sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'desc' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const SubjectResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const ListSubjectsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(SubjectResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listSubjectRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Subjects'],
            body: SubjectListQuery,
            response: {
                200: ListSubjectsResponse,
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
            request: FastifyRequest<{ Body: typeof SubjectListQuery.static }>,
            reply: FastifyReply
        ) {
            const { search, isActive, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [];

            // Add active status condition if provided
            if (isActive !== undefined) {
                conditions.push(eq(examSubjects.isActive, isActive));
            }

            // Add search condition
            if (search && search.trim() !== '') {
                const searchTerm = `%${search.trim().toLowerCase()}%`;
                conditions.push(
                    or(
                        ilike(examSubjects.name, searchTerm),
                        ilike(examSubjects.description, searchTerm)
                    )
                );
            }

            // Build Query
            let baseQuery = db.select().from(examSubjects);
            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Add Sorting
            const order = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'name':
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examSubjects.name)
                        : baseQuery.orderBy(desc(examSubjects.name));
                    break;
                case 'createdAt':
                default:
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examSubjects.createdAt)
                        : baseQuery.orderBy(desc(examSubjects.createdAt));
                    break;
            }

            // Meta calculations
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(queryWithSort.as('subquery'));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Execute Paginated Fetch
            const items = await queryWithSort
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.subjects.list.success'),
                data: {
                    items: items.map(sub => ({
                        ...sub,
                        createdAt: sub.createdAt.toISOString(),
                        updatedAt: sub.updatedAt.toISOString(),
                    })),
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

export default listSubjectRoute;
