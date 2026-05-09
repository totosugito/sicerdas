import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { db } from "../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageSections,
  examPackageQuestions,
  examQuestions,
  examQuestionTags,
} from "../../../../db/schema/exam/index.ts";
import { and, eq, sql, inArray } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { EnumExamType } from "../../../../db/schema/exam/enums.ts";

const GenerateCustomRequest = Type.Object({
  categoryId: Type.String({ format: "uuid" }),
  educationGradeId: Type.Number(),
  tagIds: Type.Array(Type.String({ format: "uuid" })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
  packageTitle: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  sectionTitle: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
});

const GenerateCustomResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    packageId: Type.String({ format: "uuid" }),
    sectionId: Type.String({ format: "uuid" }),
  }),
});

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/generate-custom",
    method: "POST",
    schema: {
      tags: ["Exam Packages"],
      summary: "Generate a custom practice package",
      description: "Creates a new private exam package based on specific grade and tags",
      body: GenerateCustomRequest,
      response: {
        201: GenerateCustomResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Body: typeof GenerateCustomRequest.static }>,
      reply: FastifyReply,
    ): Promise<typeof GenerateCustomResponse.static> {
      const { t } = getTypedI18n(req);
      const userId = (req as any).session.user.id;
      const { 
        categoryId, 
        educationGradeId, 
        tagIds, 
        limit = 10, 
        packageTitle, 
        sectionTitle 
      } = req.body;

      const defaultPackageTitle = `Latihan Kustom - ${new Date().toLocaleDateString('id-ID')}`;
      const defaultSectionTitle = "Latihan Utama";

      // 1. Find random questions matching criteria
      const selectedQuestions = await db
        .select({ id: examQuestions.id })
        .from(examQuestions)
        .innerJoin(examQuestionTags, eq(examQuestions.id, examQuestionTags.questionId))
        .where(
          and(
            eq(examQuestions.educationGradeId, educationGradeId),
            inArray(examQuestionTags.tagId, tagIds)
          )
        )
        .orderBy(sql`RANDOM()`)
        .limit(limit);

      if (selectedQuestions.length === 0) {
        return reply.notFound(t(($) => $.exam.packages.generateCustom.noQuestions));
      }

      // 2. Create the package
      const [newPackage] = await db
        .insert(examPackages)
        .values({
          categoryId,
          title: packageTitle || defaultPackageTitle,
          examType: EnumExamType.CUSTOM_PRACTICE,
          createdByUserId: userId,
          educationGradeId,
          isActive: true,
          requiredTier: "free",
          durationMinutes: selectedQuestions.length * 2, // Estimate 2 mins per question
          totalSections: 1,
          activeSections: 1,
          totalQuestions: selectedQuestions.length,
          activeQuestions: selectedQuestions.length,
        })
        .returning({ id: examPackages.id });

      // 3. Create a default section
      const [newSection] = await db
        .insert(examPackageSections)
        .values({
          packageId: newPackage.id,
          title: sectionTitle || defaultSectionTitle,
          order: 1,
          isActive: true,
          totalQuestions: selectedQuestions.length,
          activeQuestions: selectedQuestions.length,
          createdByUserId: userId,
        })
        .returning({ id: examPackageSections.id });

      // 4. Link questions
      const packageQuestionsData = selectedQuestions.map((q, index) => ({
        packageId: newPackage.id,
        sectionId: newSection.id,
        questionId: q.id,
        order: index + 1,
      }));

      await db.insert(examPackageQuestions).values(packageQuestionsData);

      return reply.status(201).send({
        success: true,
        message: t(($) => $.exam.packages.generateCustom.success),
        data: {
          packageId: newPackage.id,
          sectionId: newSection.id,
        },
      });
    }),
  });
};

export default protectedRoute;
