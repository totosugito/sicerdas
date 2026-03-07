import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackageSections } from '../../../../db/schema/exam/package-sections.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { eq, sql } from 'drizzle-orm';
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const CreateSectionBody = Type.Object({
    packageId: Type.String({ format: 'uuid' }),
    title: Type.String({ minLength: 1, maxLength: 255 }),
    durationMinutes: Type.Optional(Type.Number({ minimum: 0 })),
    order: Type.Optional(Type.Number({ default: -1 })),
    isActive: Type.Optional(Type.Boolean({ default: true })),
});

const CreateSectionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        id: Type.String({ format: 'uuid' }),
    }),
});

const createSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Package Sections'],
            body: CreateSectionBody,
            response: {
                201: CreateSectionResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof CreateSectionBody.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { packageId, title, durationMinutes, order, isActive } = request.body;
            let orderToUse = order ?? -1;

            // 1. Check if package exists
            const existingPackage = await db.query.examPackages.findFirst({
                where: eq(examPackages.id, packageId)
            });

            if (!existingPackage) {
                return reply.notFound(t($ => $.exam.packages.update.notFound));
            }

            // 2. Handle auto-order if order is < 0
            if (orderToUse < 0) {
                const [countResult] = await db.select({
                    total: sql<number>`count(*)`
                })
                    .from(examPackageSections)
                    .where(eq(examPackageSections.packageId, packageId));

                const currentTotal = Number(countResult?.total || 0);
                orderToUse = currentTotal + 1;
            }

            const [newSection] = await db.insert(examPackageSections)
                .values({
                    packageId,
                    title,
                    durationMinutes,
                    order: orderToUse,
                    isActive: isActive ?? true,
                })
                .returning({ id: examPackageSections.id });

            return reply.status(201).send({
                success: true,
                message: t($ => $.exam.package_sections.create.success),
                data: {
                    id: newSection.id,
                },
            });
        }),
    });
};

export default createSectionRoute;
