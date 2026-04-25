import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { eq, or } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const CreateEducationGradeBody = Type.Object({
  grade: Type.String({ minLength: 1, maxLength: 32 }),
  name: Type.String({ minLength: 1, maxLength: 128 }),
  desc: Type.Optional(Type.String()),
  extra: Type.Optional(Type.Any()),
  isDefault: Type.Optional(Type.Boolean({ default: true })),
});

const EducationGradeResponseItem = Type.Object({
  id: Type.Number(),
  grade: Type.String(),
  name: Type.String(),
  desc: Type.Union([Type.String(), Type.Null()]),
  isDefault: Type.Boolean(),
  createdAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  updatedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
});

const CreateEducationGradeResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: EducationGradeResponseItem,
});

const createEducationGradeRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Education Grades"],
      body: CreateEducationGradeBody,
      response: {
        201: CreateEducationGradeResponse,
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
      request: FastifyRequest<{ Body: typeof CreateEducationGradeBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { grade, name, desc, extra, isDefault } = request.body;

      // Check if grade or name already exists
      const existingGrade = await db.query.educationGrades.findFirst({
        where: or(eq(educationGrades.grade, grade), eq(educationGrades.name, name)),
      });

      if (existingGrade) {
        return reply.badRequest(t(($) => $.education.grades.create.exists));
      }

      const userId = request.session.user.id;

      const [newGrade] = await db
        .insert(educationGrades)
        .values({
          grade,
          name,
          desc: desc ?? "",
          extra: extra ?? {},
          createdByUserId: userId,
          isDefault: isDefault ?? true,
        })
        .returning();

      return reply.status(201).send({
        success: true,
        message: t(($) => $.education.grades.create.success),
        data: {
          ...newGrade,
          createdAt: newGrade.createdAt ? newGrade.createdAt.toISOString() : null,
          updatedAt: newGrade.updatedAt ? newGrade.updatedAt.toISOString() : null,
        },
      });
    }),
  });
};

export default createEducationGradeRoute;
