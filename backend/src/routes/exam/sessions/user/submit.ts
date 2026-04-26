import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examSessions } from "../../../../db/schema/exam/sessions.ts";
import { examSessionAnswers } from "../../../../db/schema/exam/session-answers.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { examUserStatsGlobal } from "../../../../db/schema/exam/user-stats-global.ts";
import { examUserStatsSubject } from "../../../../db/schema/exam/user-stats-subject.ts";
import { examUserStatsTag } from "../../../../db/schema/exam/user-stats-tag.ts";
import { EnumExamSessionStatus } from "../../../../db/schema/exam/enums.ts";
import { eq, and, inArray, sql } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const SubmitSessionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const SubmitSessionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    score: Type.Number(),
    totalCorrect: Type.Number(),
    totalWrong: Type.Number(),
    totalSkipped: Type.Number(),
    totalQuestions: Type.Number(),
  }),
});

const submitSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/submit/:id",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      params: SubmitSessionParams,
      response: {
        200: SubmitSessionResponse,
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
      request: FastifyRequest<{ Params: typeof SubmitSessionParams.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { id } = request.params;

      // 1. Get Session
      const [session] = await db
        .select({ id: examSessions.id, status: examSessions.status })
        .from(examSessions)
        .where(and(eq(examSessions.id, id), eq(examSessions.userId, userId)))
        .limit(1);

      if (!session) {
        return reply.notFound(t(($) => $.exam.sessions.submit.notFound));
      }

      if (session.status !== EnumExamSessionStatus.IN_PROGRESS) {
        return reply.forbidden(t(($) => $.exam.sessions.submit.alreadySubmitted));
      }

      // 2. Fetch all answers and corresponding correct options, subjects, and tags
      const studentAnswers = await db
        .select({
          id: examSessionAnswers.id,
          questionId: examSessionAnswers.questionId,
          selectedOptionId: examSessionAnswers.selectedOptionId,
          textAnswer: examSessionAnswers.textAnswer,
          subjectId: examQuestions.subjectId,
        })
        .from(examSessionAnswers)
        .innerJoin(examQuestions, eq(examSessionAnswers.questionId, examQuestions.id))
        .where(eq(examSessionAnswers.sessionId, id));

      if (studentAnswers.length === 0) {
        return reply.badRequest(t(($) => $.exam.sessions.submit.noQuestions));
      }

      const questionIds = studentAnswers.map((a) => a.questionId);

      // Fetch correct options for these questions
      const correctOptions = await db
        .select({
          id: examQuestionOptions.id,
          questionId: examQuestionOptions.questionId,
        })
        .from(examQuestionOptions)
        .where(
          and(
            inArray(examQuestionOptions.questionId, questionIds),
            eq(examQuestionOptions.isCorrect, true),
          ),
        );

      // Fetch tags for these questions
      const questionTagsRes = await db
        .select({
          questionId: examQuestionTags.questionId,
          tagId: examQuestionTags.tagId,
        })
        .from(examQuestionTags)
        .where(inArray(examQuestionTags.questionId, questionIds));

      // 3. Process Scoring & Stats Aggregation
      let totalCorrect = 0;
      let totalWrong = 0;
      let totalSkipped = 0;
      const totalQuestions = studentAnswers.length;

      // Aggregators for subject and tag stats
      const subjectStatsMap = new Map<
        string,
        { total: number; correct: number; wrong: number; skipped: number }
      >();
      const tagStatsMap = new Map<
        string,
        { total: number; correct: number; wrong: number; skipped: number }
      >();

      for (const answer of studentAnswers) {
        const correct = correctOptions.find((o) => o.questionId === answer.questionId);

        const isSkipped =
          !answer.selectedOptionId && (!answer.textAnswer || answer.textAnswer.length === 0);
        const isCorrect = !isSkipped && answer.selectedOptionId === correct?.id;
        const isWrong = !isSkipped && !isCorrect;

        if (isCorrect) totalCorrect++;
        else if (isWrong) totalWrong++;
        else totalSkipped++;

        // Track Subject Stats
        const sId = answer.subjectId;
        if (!subjectStatsMap.has(sId))
          subjectStatsMap.set(sId, { total: 0, correct: 0, wrong: 0, skipped: 0 });
        const sStat = subjectStatsMap.get(sId)!;
        sStat.total++;
        if (isCorrect) sStat.correct++;
        else if (isWrong) sStat.wrong++;
        else sStat.skipped++;

        // Track Tag Stats
        const qTags = questionTagsRes.filter((qt) => qt.questionId === answer.questionId);
        for (const qt of qTags) {
          if (!tagStatsMap.has(qt.tagId))
            tagStatsMap.set(qt.tagId, { total: 0, correct: 0, wrong: 0, skipped: 0 });
          const tStat = tagStatsMap.get(qt.tagId)!;
          tStat.total++;
          if (isCorrect) tStat.correct++;
          else if (isWrong) tStat.wrong++;
          else tStat.skipped++;
        }

        // Update individual answer record
        await db
          .update(examSessionAnswers)
          .set({ isCorrect: isSkipped ? null : isCorrect, updatedAt: new Date() })
          .where(eq(examSessionAnswers.id, answer.id));
      }

      const finalScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

      // 4. Update Statistics Tables (Incremental)
      await db.transaction(async (tx) => {
        // 4a. Global Stats
        await tx
          .insert(examUserStatsGlobal)
          .values({
            userId,
            totalExamsTaken: 1,
            totalQuestionsAnswered: totalQuestions - totalSkipped,
            totalCorrectAnswers: totalCorrect,
            totalWrongAnswers: totalWrong,
            averageScore: finalScore.toString(),
            lastActiveAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: examUserStatsGlobal.userId,
            set: {
              totalExamsTaken: sql`${examUserStatsGlobal.totalExamsTaken} + 1`,
              totalQuestionsAnswered: sql`${examUserStatsGlobal.totalQuestionsAnswered} + ${totalQuestions - totalSkipped}`,
              totalCorrectAnswers: sql`${examUserStatsGlobal.totalCorrectAnswers} + ${totalCorrect}`,
              totalWrongAnswers: sql`${examUserStatsGlobal.totalWrongAnswers} + ${totalWrong}`,
              averageScore: sql`(${examUserStatsGlobal.averageScore} * ${examUserStatsGlobal.totalExamsTaken} + ${finalScore}) / (${examUserStatsGlobal.totalExamsTaken} + 1)`,
              lastActiveAt: new Date(),
              updatedAt: new Date(),
            },
          });

        // 4b. Subject Stats
        for (const [sId, sStat] of subjectStatsMap.entries()) {
          await tx
            .insert(examUserStatsSubject)
            .values({
              userId,
              subjectId: sId,
              totalQuestionsAnswered: sStat.total - sStat.skipped,
              totalCorrect: sStat.correct,
              totalWrong: sStat.wrong,
              accuracyRate:
                sStat.total - sStat.skipped > 0
                  ? ((sStat.correct / (sStat.total - sStat.skipped)) * 100).toString()
                  : "0",
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [examUserStatsSubject.userId, examUserStatsSubject.subjectId],
              set: {
                totalQuestionsAnswered: sql`${examUserStatsSubject.totalQuestionsAnswered} + ${sStat.total - sStat.skipped}`,
                totalCorrect: sql`${examUserStatsSubject.totalCorrect} + ${sStat.correct}`,
                totalWrong: sql`${examUserStatsSubject.totalWrong} + ${sStat.wrong}`,
                accuracyRate: sql`CASE WHEN (${examUserStatsSubject.totalQuestionsAnswered} + ${sStat.total - sStat.skipped}) > 0 THEN (${examUserStatsSubject.totalCorrect} + ${sStat.correct})::decimal / (${examUserStatsSubject.totalQuestionsAnswered} + ${sStat.total - sStat.skipped}) * 100 ELSE 0 END`,
                updatedAt: new Date(),
              },
            });
        }

        // 4c. Tag Stats
        for (const [tId, tStat] of tagStatsMap.entries()) {
          await tx
            .insert(examUserStatsTag)
            .values({
              userId,
              tagId: tId,
              totalQuestionsAnswered: tStat.total - tStat.skipped,
              totalCorrect: tStat.correct,
              totalWrong: tStat.wrong,
              accuracyRate:
                tStat.total - tStat.skipped > 0
                  ? ((tStat.correct / (tStat.total - tStat.skipped)) * 100).toString()
                  : "0",
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [examUserStatsTag.userId, examUserStatsTag.tagId],
              set: {
                totalQuestionsAnswered: sql`${examUserStatsTag.totalQuestionsAnswered} + ${tStat.total - tStat.skipped}`,
                totalCorrect: sql`${examUserStatsTag.totalCorrect} + ${tStat.correct}`,
                totalWrong: sql`${examUserStatsTag.totalWrong} + ${tStat.wrong}`,
                accuracyRate: sql`CASE WHEN (${examUserStatsTag.totalQuestionsAnswered} + ${tStat.total - tStat.skipped}) > 0 THEN (${examUserStatsTag.totalCorrect} + ${tStat.correct})::decimal / (${examUserStatsTag.totalQuestionsAnswered} + ${tStat.total - tStat.skipped}) * 100 ELSE 0 END`,
                updatedAt: new Date(),
              },
            });
        }

        // 5. Finalize Session
        await tx
          .update(examSessions)
          .set({
            status: EnumExamSessionStatus.COMPLETED,
            endTime: new Date(),
            score: finalScore.toString(),
            totalCorrect,
            totalWrong,
            totalSkipped,
            updatedAt: new Date(),
          })
          .where(eq(examSessions.id, id));
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.sessions.submit.success),
        data: {
          score: finalScore,
          totalCorrect,
          totalWrong,
          totalSkipped,
          totalQuestions,
        },
      });
    }),
  });
};

export default submitSessionRoute;
