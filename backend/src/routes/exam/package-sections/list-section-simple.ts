import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { examPackageSections } from '../../../db/schema/exam/package-sections.ts';
import { and, eq, asc, sql } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const SectionSimpleQuery = Type.Object({
    packageId: Type.Optional(Type.String({ format: 'uuid' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

const SectionSimpleResponseItem = Type.Object({
    value: Type.String({ format: 'uuid' }),
    label: Type.String(),
});

const ListSectionsSimpleResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(SectionSimpleResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listSectionsSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list-simple',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Package Sections'],
            body: SectionSimpleQuery,
            response: {
                200: ListSectionsSimpleResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof SectionSimpleQuery.static }>,
            reply: FastifyReply
        ) {
            const { packageId, page = 1, limit = 1000 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [eq(examPackageSections.isActive, true)];
            if (packageId) {
                conditions.push(eq(examPackageSections.packageId, packageId));
            }

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(examPackageSections)
                .where(and(...conditions));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await db.select({
                value: examPackageSections.id,
                label: examPackageSections.title,
            })
                .from(examPackageSections)
                .where(and(...conditions))
                .orderBy(asc(examPackageSections.order))
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.package-sections.list.success'),
                data: {
                    items,
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

export default listSectionsSimpleRoute;
