import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { EnumDifficultyLevel, EnumQuestionType } from "../../../../db/schema/exam/enums.ts";

const VariableFormulasType = Type.Optional(
  Type.Object({
    variables: Type.Array(Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))),
    options: Type.Optional(Type.Record(Type.String(), Type.String())),
    solutions: Type.Optional(Type.Record(Type.String(), Type.String())),
  }),
);

const CreateQuestionBody = Type.Object({
  subjectId: Type.String({ format: "uuid" }),
  passageId: Type.Optional(Type.Union([Type.String({ format: "uuid" }), Type.Null()])), // Nullable for questions without passages
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())), // BlockNote JSON format
  difficulty: Type.Enum(EnumDifficultyLevel, { default: EnumDifficultyLevel.MEDIUM }),
  type: Type.Enum(EnumQuestionType, { default: EnumQuestionType.MULTIPLE_CHOICE }),
  requiredTier: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  educationGradeId: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  isActive: Type.Optional(Type.Boolean({ default: true })),
  variableFormulas: VariableFormulasType,
});

const QuestionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  subjectId: Type.String({ format: "uuid" }),
  passageId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  difficulty: Type.String(),
  type: Type.String(),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  educationGradeId: Type.Union([Type.Number(), Type.Null()]),
  isActive: Type.Boolean(),
  variableFormulas: VariableFormulasType,
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const CreateQuestionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: QuestionResponseItem,
});

const createQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Questions"],
      body: CreateQuestionBody,
      response: {
        201: CreateQuestionResponse,
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
      request: FastifyRequest<{ Body: typeof CreateQuestionBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const {
        subjectId,
        passageId,
        content,
        difficulty,
        type,
        requiredTier,
        educationGradeId,
        isActive,
        variableFormulas,
      } = request.body;

      const userId = request.session.user.id;

      // 1. Verify that the subject exists
      const existingSubject = await db.query.examSubjects.findFirst({
        where: eq(examSubjects.id, subjectId),
      });

      if (!existingSubject) {
        return reply.badRequest(t(($) => $.exam.questions.create.invalidSubject));
      }

      // 2. Verify passage exists (if provided)
      if (passageId) {
        const existingPassage = await db.query.examPassages.findFirst({
          where: eq(examPassages.id, passageId),
        });
        if (!existingPassage) {
          return reply.badRequest(t(($) => $.exam.questions.create.invalidPassage));
        }
      }

      // We do not do a "name" duplication check like on subjects/categories
      // Because questions are unique mostly by their content and can be arbitrarily identical

      const [newQuestion] = await db
        .insert(examQuestions)
        .values({
          subjectId,
          passageId,
          content,
          difficulty,
          type,
          requiredTier: requiredTier !== undefined ? requiredTier : "free",
          educationGradeId: educationGradeId !== undefined ? educationGradeId : null,
          isActive: isActive !== undefined ? isActive : true,
          variableFormulas,
          createdByUserId: userId,
        })
        .returning();

      return reply.status(201).send({
        success: true,
        message: t(($) => $.exam.questions.create.success),
        data: {
          ...newQuestion,
          createdAt: newQuestion.createdAt.toISOString(),
          updatedAt: newQuestion.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default createQuestionRoute;
