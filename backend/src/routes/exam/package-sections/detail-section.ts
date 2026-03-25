import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import { examPackageSections } from "../../../db/schema/exam/package-sections.ts";
import { examPackages } from "../../../db/schema/exam/packages.ts";
import { examPackageQuestions } from "../../../db/schema/exam/package-questions.ts";
import { examQuestions } from "../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../db/schema/exam/subjects.ts";
import { eq, asc, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const DetailSectionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const DetailSectionQuery = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const QuestionItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  content: Type.Array(Type.Any()), // BlockNote content
  type: Type.String(),
  difficulty: Type.String(),
  subjectName: Type.Union([Type.String(), Type.Null()]),
  order: Type.Number(),
});

const SectionDetailItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  packageId: Type.String({ format: "uuid" }),
  packageName: Type.String(),
  title: Type.String(),
  durationMinutes: Type.Number(),
  order: Type.Number(),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  questions: Type.Object({
    items: Type.Array(QuestionItem),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});

const DetailSectionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: SectionDetailItem,
});

const detailSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Exam Package Sections"],
      params: DetailSectionParams,
      querystring: DetailSectionQuery,
      response: {
        200: DetailSectionResponse,
        "4xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
        "5xx": Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{
        Params: typeof DetailSectionParams.static;
        Querystring: typeof DetailSectionQuery.static;
      }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;
      const { page = 1, limit = 10 } = request.query;
      const offset = (page - 1) * limit;

      // 1. Get Section & Package Information
      const [sectionResult] = await db
        .select({
          section: examPackageSections,
          packageName: examPackages.title,
        })
        .from(examPackageSections)
        .innerJoin(examPackages, eq(examPackageSections.packageId, examPackages.id))
        .where(eq(examPackageSections.id, id))
        .limit(1);

      if (!sectionResult) {
        return reply.notFound(t(($) => $.exam.package_sections.detail.notFound));
      }

      // 2. Count Total Questions linked to this section
      const [countResult] = await db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(examPackageQuestions)
        .where(eq(examPackageQuestions.sectionId, id));

      const total = countResult?.count || 0;
      const totalPages = Math.ceil(total / limit);

      // 3. Get Paginated Questions
      const questions = await db
        .select({
          id: examQuestions.id,
          content: examQuestions.content,
          type: examQuestions.type,
          difficulty: examQuestions.difficulty,
          subjectName: examSubjects.name,
          order: examPackageQuestions.order,
        })
        .from(examPackageQuestions)
        .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
        .leftJoin(examSubjects, eq(examQuestions.subjectId, examSubjects.id))
        .where(eq(examPackageQuestions.sectionId, id))
        .orderBy(asc(examPackageQuestions.order))
        .limit(limit)
        .offset(offset);

      const section = sectionResult.section;

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.package_sections.detail.success),
        data: {
          id: section.id,
          packageId: section.packageId,
          packageName: sectionResult.packageName,
          title: section.title,
          durationMinutes: section.durationMinutes,
          order: section.order,
          isActive: section.isActive,
          createdAt: section.createdAt.toISOString(),
          updatedAt: section.updatedAt.toISOString(),
          questions: {
            items: questions as any,
            meta: {
              total,
              page,
              limit,
              totalPages,
            },
          },
        },
      });
    }),
  });
};

export default detailSectionRoute;
