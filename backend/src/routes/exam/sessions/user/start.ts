import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examPackages } from "../../../../db/schema/exam/packages.ts";
import { examPackageSections } from "../../../../db/schema/exam/package-sections.ts";
import { examPackageQuestions } from "../../../../db/schema/exam/package-questions.ts";
import { examSessionAnswers } from "../../../../db/schema/exam/session-answers.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../../db/schema/exam/enums.ts";
import { eq, and, inArray } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { shuffleArray } from "../../../../utils/my-utils.ts";

const StartSessionBody = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  sectionId: Type.String({ format: "uuid" }),
  mode: Type.Enum(EnumExamSessionMode),
});

const StartSessionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    sessionId: Type.String({ format: "uuid" }),
    isResumed: Type.Boolean(),
  }),
});

const startSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/start",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      body: StartSessionBody,
      response: {
        201: StartSessionResponse,
        200: StartSessionResponse,
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
      request: FastifyRequest<{ Body: typeof StartSessionBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { packageId, sectionId, mode } = request.body;

      // 1. Check if package and section exist and are active
      const [section] = await db
        .select({ id: examPackageSections.id })
        .from(examPackageSections)
        .innerJoin(examPackages, eq(examPackageSections.packageId, examPackages.id))
        .where(
          and(
            eq(examPackageSections.id, sectionId),
            eq(examPackageSections.packageId, packageId),
            eq(examPackageSections.isActive, true),
            eq(examPackages.isActive, true),
          ),
        )
        .limit(1);

      if (!section) {
        return reply.notFound(t(($) => $.exam.packages.update.notFound));
      }

      // 2. Check for existing IN_PROGRESS session (Resume Capability)
      const [existingSession] = await db
        .select({ id: examSessions.id })
        .from(examSessions)
        .where(
          and(
            eq(examSessions.userId, userId),
            eq(examSessions.packageId, packageId),
            eq(examSessions.sectionId, sectionId),
            eq(examSessions.mode, mode),
            eq(examSessions.status, EnumExamSessionStatus.IN_PROGRESS),
          ),
        )
        .limit(1);

      if (existingSession) {
        return reply.status(200).send({
          success: true,
          message: t(($) => $.exam.sessions.start.success),
          data: {
            sessionId: existingSession.id,
            isResumed: true,
          },
        });
      }

      // 3. Create a new session
      const [newSession] = await db
        .insert(examSessions)
        .values({
          userId,
          packageId,
          sectionId,
          mode,
          isTimerActive: mode === EnumExamSessionMode.TRYOUT,
          status: EnumExamSessionStatus.IN_PROGRESS,
        })
        .returning({ id: examSessions.id });

      // 4. Fetch questions for this section
      const questionsRaw = await db
        .select({
          questionId: examPackageQuestions.questionId,
          variableFormulas: examQuestions.variableFormulas,
        })
        .from(examPackageQuestions)
        .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
        .where(eq(examPackageQuestions.sectionId, sectionId));

      if (questionsRaw.length > 0) {
        // A. Scramble question order
        const shuffledQuestions = shuffleArray(questionsRaw);

        // B. Fetch all options for these questions to scramble them
        const questionIds = shuffledQuestions.map((q) => q.questionId);
        const allOptions = await db
          .select({ id: examQuestionOptions.id, questionId: examQuestionOptions.questionId })
          .from(examQuestionOptions)
          .where(inArray(examQuestionOptions.questionId, questionIds));

        // C. Prepare answer rows with scrambled data
        const answerValues = shuffledQuestions.map((q, index) => {
          // Scramble option IDs for this question
          const questionOptions = allOptions
            .filter((o) => o.questionId === q.questionId)
            .map((o) => o.id);

          const shuffledOptionsOrder = shuffleArray(questionOptions);

          // Handle variable variations
          let variationIndex = 0;
          const vars = q.variableFormulas?.variables;
          if (Array.isArray(vars) && vars.length > 0) {
            variationIndex = Math.floor(Math.random() * vars.length);
          }

          return {
            sessionId: newSession.id,
            questionId: q.questionId,
            questionOrder: index + 1, // Randomized sequence
            variationIndex,
            isDoubtful: false,
            shuffledOptionsOrder,
          };
        });

        await db.insert(examSessionAnswers).values(answerValues);
      }

      return reply.status(201).send({
        success: true,
        message: t(($) => $.exam.sessions.start.success),
        data: {
          sessionId: newSession.id,
          isResumed: false,
        },
      });
    }),
  });
};

export default startSessionRoute;
