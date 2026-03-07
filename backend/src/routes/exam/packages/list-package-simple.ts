import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { examPackages } from '../../../db/schema/exam/packages.ts';
import { and, eq, asc, sql } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const PackageSimpleQuery = Type.Object({
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

const PackageSimpleResponseItem = Type.Object({
    value: Type.String({ format: 'uuid' }),
    label: Type.String(),
});

const ListPackagesSimpleResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(PackageSimpleResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listPackagesSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list-simple',
        method: 'POST',
        schema: {
            tags: ['Exam Packages'],
            body: PackageSimpleQuery,
            response: {
                200: ListPackagesSimpleResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof PackageSimpleQuery.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { page = 1, limit = 1000 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [eq(examPackages.isActive, true)];

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(examPackages)
                .where(and(...conditions));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await db.select({
                value: examPackages.id,
                label: examPackages.title,
            })
                .from(examPackages)
                .where(and(...conditions))
                .orderBy(asc(examPackages.title))
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.packages.list.success),
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

export default listPackagesSimpleRoute;
