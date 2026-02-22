import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackageSections } from '../../../../db/schema/exam/package-sections.ts';
import { and, eq, sql } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const SectionListQuery = Type.Object({
    packageId: Type.String({ format: 'uuid' }),
    isActive: Type.Optional(Type.Boolean()),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const SectionResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    packageId: Type.String({ format: 'uuid' }),
    title: Type.String(),
    durationMinutes: Type.Union([Type.Number(), Type.Null()]),
    order: Type.Number(),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const ListSectionsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
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
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof SectionListQuery.static }>,
            reply: FastifyReply
        ) {
            const { packageId, isActive, page = 1, limit = 10 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [eq(examPackageSections.packageId, packageId)];
            if (isActive !== undefined) conditions.push(eq(examPackageSections.isActive, isActive));

            const baseQuery = db.select()
                .from(examPackageSections)
                .where(and(...conditions))
                .orderBy(examPackageSections.order);

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(baseQuery.as('subquery'));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await baseQuery
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.package-sections.list.success'),
                data: {
                    items: items.map(s => ({
                        ...s,
                        createdAt: s.createdAt.toISOString(),
                        updatedAt: s.updatedAt.toISOString(),
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

export default listSectionsRoute;
