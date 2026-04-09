import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq, asc } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import {
  EnumDifficultyLevel,
  EnumQuestionType,
  EnumScoringStrategy,
  EnumSolutionType,
} from "../../../../db/schema/exam/enums.ts";

const VariableFormulasType = Type.Optional(
  Type.Object({
    variables: Type.Array(Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))),
    options: Type.Optional(Type.Record(Type.String(), Type.String())),
    solutions: Type.Optional(Type.Record(Type.String(), Type.String())),
  }),
);
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { resolveBlockNoteUrls } from "../../../../utils/question-utils.ts";

const GetQuestionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const QuestionResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  subjectId: Type.String({ format: "uuid" }),
  subjectName: Type.String(),
  passageId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  reasonContent: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
  difficulty: Type.Enum(EnumDifficultyLevel),
  type: Type.Enum(EnumQuestionType),
  maxScore: Type.Integer(),
  scoringStrategy: Type.Enum(EnumScoringStrategy),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  educationGradeId: Type.Union([Type.Number(), Type.Null()]),
  educationGradeName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  isActive: Type.Boolean(),
  variableFormulas: VariableFormulasType,
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  options: Type.Array(
    Type.Object({
      id: Type.String({ format: "uuid" }),
      content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
      isCorrect: Type.Boolean(),
      score: Type.Integer(),
      order: Type.Number(),
    }),
  ),
  solutions: Type.Array(
    Type.Object({
      id: Type.String({ format: "uuid" }),
      title: Type.String(),
      content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
      solutionType: Type.Enum(EnumSolutionType),
      order: Type.Number(),
      requiredTier: Type.Union([Type.String(), Type.Null()]),
    }),
  ),
  tags: Type.Array(
    Type.Object({
      id: Type.String({ format: "uuid" }),
      name: Type.String(),
    }),
  ),
  passage: Type.Union([
    Type.Object({
      title: Type.Union([Type.String(), Type.Null()]),
      content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    }),
    Type.Null(),
  ]),
});

const GetQuestionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: QuestionResponseItem,
});

const getQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Admin Exam Questions"],
      params: GetQuestionParams,
      response: {
        200: GetQuestionResponse,
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
      request: FastifyRequest<{ Params: typeof GetQuestionParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { id } = request.params;

      const [question] = await db
        .select({
          id: examQuestions.id,
          subjectId: examQuestions.subjectId,
          subjectName: examSubjects.name,
          passageId: examQuestions.passageId,
          content: examQuestions.content,
          difficulty: examQuestions.difficulty,
          type: examQuestions.type,
          maxScore: examQuestions.maxScore,
          scoringStrategy: examQuestions.scoringStrategy,
          requiredTier: examQuestions.requiredTier,
          educationGradeId: examQuestions.educationGradeId,
          educationGradeName: educationGrades.name,
          isActive: examQuestions.isActive,
          variableFormulas: examQuestions.variableFormulas,
          reasonContent: examQuestions.reasonContent,
          createdAt: examQuestions.createdAt,
          updatedAt: examQuestions.updatedAt,
        })
        .from(examQuestions)
        .innerJoin(examSubjects, eq(examQuestions.subjectId, examSubjects.id))
        .leftJoin(educationGrades, eq(examQuestions.educationGradeId, educationGrades.id))
        .where(eq(examQuestions.id, id))
        .limit(1);

      if (!question) {
        return reply.notFound(t(($) => $.exam.questions.update.notFound));
      }

      // Fetch Options
      const options = await db
        .select({
          id: examQuestionOptions.id,
          content: examQuestionOptions.content,
          isCorrect: examQuestionOptions.isCorrect,
          score: examQuestionOptions.score,
          order: examQuestionOptions.order,
        })
        .from(examQuestionOptions)
        .where(eq(examQuestionOptions.questionId, id))
        .orderBy(asc(examQuestionOptions.order));

      // Fetch Solutions
      const solutions = await db
        .select({
          id: examQuestionSolutions.id,
          title: examQuestionSolutions.title,
          content: examQuestionSolutions.content,
          solutionType: examQuestionSolutions.solutionType,
          order: examQuestionSolutions.order,
          requiredTier: examQuestionSolutions.requiredTier,
        })
        .from(examQuestionSolutions)
        .where(eq(examQuestionSolutions.questionId, id))
        .orderBy(asc(examQuestionSolutions.order));

      // Fetch Tags
      const tags = await db
        .select({
          id: educationTags.id,
          name: educationTags.name,
        })
        .from(examQuestionTags)
        .innerJoin(educationTags, eq(examQuestionTags.tagId, educationTags.id))
        .where(eq(examQuestionTags.questionId, id));

      // Fetch Passage
      let passage = null;
      if (question.passageId) {
        const fetchedPassage = await db.query.examPassages.findFirst({
          where: eq(examPassages.id, question.passageId),
        });
        if (fetchedPassage) {
          passage = {
            title: fetchedPassage.title,
            content: fetchedPassage.content,
          };
        }
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.questions.list.success),
        data: {
          ...question,
          content: resolveBlockNoteUrls(question.content as any[]),
          reasonContent: resolveBlockNoteUrls(question.reasonContent as any[]),
          createdAt: question.createdAt.toISOString(),
          updatedAt: question.updatedAt.toISOString(),
          options: options.map((opt) => ({
            ...opt,
            content: resolveBlockNoteUrls(opt.content as any[]),
          })),
          solutions: solutions.map((sol) => ({
            ...sol,
            content: resolveBlockNoteUrls(sol.content as any[]),
          })),
          tags,
          passage: passage
            ? {
                ...passage,
                content: resolveBlockNoteUrls(passage.content as any[]),
              }
            : null,
        },
      });
    }),
  });
};

export default getQuestionRoute;
