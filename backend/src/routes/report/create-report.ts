import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { EnumReportReason } from "../../db/schema/enum-general.ts";
import { EnumContentType } from "../../db/schema/enum-app.ts";
import { userContentReport } from "../../db/schema/user-report-schema.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

const CreateReportBody = Type.Object({
    name: Type.String({ minLength: 1 }),
    email: Type.String({ format: 'email' }),
    title: Type.String({ minLength: 1 }),
    contentType: Type.Enum(EnumContentType),
    referenceId: Type.String({ format: 'uuid' }),
    reason: Type.Enum(EnumReportReason),
    description: Type.Optional(Type.String()),
    extra: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
});

const CreateReportResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        id: Type.String({ format: 'uuid' })
    })
});

const createReportRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['V1/Report'],
            summary: 'Create a new report',
            description: 'Submit a new user report for content',
            body: CreateReportBody,
            response: {
                200: CreateReportResponse,
                '5xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                })
            }
        },
        handler: withErrorHandler(async function handler(
            req: FastifyRequest<{ Body: typeof CreateReportBody.static }>,
            reply: FastifyReply
        ) {
            const { name, email, title, contentType, referenceId, reason, description, extra } = req.body;

            // Attempt to retrieve user ID if available (safe cast)
            const user = (req as any).user as { id: string } | undefined;
            const reporterId = user?.id || null;

            const [newReport] = await db.insert(userContentReport).values({
                name,
                email,
                title,
                contentType,
                referenceId,
                reason,
                description,
                reporterId,
                extra: extra || {},
            }).returning({ id: userContentReport.id });

            if (!newReport) {
                return reply.internalServerError(req.i18n.t('report.create.error'));
            }

            return reply.status(200).send({
                success: true,
                message: req.i18n.t('report.create.success'),
                data: {
                    id: newReport.id
                }
            });
        })
    });
};

export default createReportRoute;
