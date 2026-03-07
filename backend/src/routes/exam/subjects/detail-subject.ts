import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { examSubjects } from '../../../db/schema/exam/subjects.ts';
import { eq, and } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { fromNodeHeaders } from 'better-auth/node';
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumUserRole } from '../../../db/schema/index.ts';
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const DetailSubjectParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const SubjectResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const DetailSubjectResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: SubjectResponseItem,
});

const detailSubjectRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/detail/:id',
        method: 'GET',
        schema: {
            tags: ['Exam Subjects'],
            params: DetailSubjectParams,
            response: {
                200: DetailSubjectResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof DetailSubjectParams.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { id } = request.params;

            // Determine user role from session
            const session = await getAuthInstance(app).api.getSession({
                headers: fromNodeHeaders(request.headers),
            });
            const user = session?.user;
            const isAdmin = user?.role === EnumUserRole.ADMIN;

            const conditions = [eq(examSubjects.id, id)];

            if (!isAdmin) {
                // Regular users can only see active subjects
                conditions.push(eq(examSubjects.isActive, true));
            }

            const subject = await db.query.examSubjects.findFirst({
                where: and(...conditions)
            });

            if (!subject) {
                return reply.notFound(t($ => $.exam.subjects.detail.notFound));
            }

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.subjects.detail.success),
                data: {
                    ...subject,
                    createdAt: subject.createdAt.toISOString(),
                    updatedAt: subject.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default detailSubjectRoute;
