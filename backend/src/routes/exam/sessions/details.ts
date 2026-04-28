import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import { examSessions } from "../../../db/schema/exam/sessions.ts";
import { examSessionAnswers } from "../../../db/schema/exam/session-answers.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../db/schema/exam/enums.ts";
import { eq, and } from "drizzle-orm";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const Params = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const SessionDetailsResponse = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    session: Type.Object({
      id: Type.String({ format: "uuid" }),
      status: Type.Enum(EnumExamSessionStatus),
      mode: Type.Enum(EnumExamSessionMode),
      elapsedSeconds: Type.Number(),
      isTimerActive: Type.Boolean(),
      score: Type.Union([Type.Number(), Type.Null()]),
    }),
    grid: Type.Array(
      Type.Object({
        questionId: Type.String({ format: "uuid" }),
        order: Type.Number(),
        isAnswered: Type.Boolean(),
        isDoubtful: Type.Boolean(),
        isCorrect: Type.Union([Type.Boolean(), Type.Null()]),
      }),
    ),
  }),
});

const detailsSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/details/:id",
    method: "GET",
    schema: {
      tags: ["Client Exam Sessions"],
      params: Params,
      response: {
        200: SessionDetailsResponse,
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
      request: FastifyRequest<{ Params: typeof Params.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const userId = (request as any).session.user.id;
      const { id } = request.params;

      // 1. Fetch the session
      const [session] = await db
        .select()
        .from(examSessions)
        .where(and(eq(examSessions.id, id), eq(examSessions.userId, userId)))
        .limit(1);

      if (!session) {
        return reply.notFound(t(($) => $.exam.sessions.errors.notFound));
      }

      // 2. Fetch the grid (answers)
      const answers = await db
        .select({
          questionId: examSessionAnswers.questionId,
          order: examSessionAnswers.questionOrder,
          selectedOptionId: examSessionAnswers.selectedOptionId,
          textAnswer: examSessionAnswers.textAnswer,
          isDoubtful: examSessionAnswers.isDoubtful,
          isCorrect: examSessionAnswers.isCorrect,
        })
        .from(examSessionAnswers)
        .where(eq(examSessionAnswers.sessionId, session.id))
        .orderBy(examSessionAnswers.questionOrder);

      const grid = answers.map((ans) => {
        const isAnswered = ans.selectedOptionId !== null || ans.textAnswer !== null;

        return {
          questionId: ans.questionId,
          order: ans.order,
          isAnswered,
          isDoubtful: ans.isDoubtful,
          // Only show correctness if it's completed OR (study mode AND answered)
          isCorrect:
            session.status === EnumExamSessionStatus.COMPLETED ||
            (session.mode === EnumExamSessionMode.STUDY && isAnswered)
              ? (ans.isCorrect ?? null)
              : null,
        };
      });

      return reply.status(200).send({
        success: true,
        data: {
          session: {
            id: session.id,
            status: session.status,
            mode: session.mode,
            elapsedSeconds: session.elapsedSeconds,
            isTimerActive: session.isTimerActive,
            score: session.score !== null ? Number(session.score) : null,
          },
          grid,
        },
      });
    }),
  });
};

export default detailsSessionRoute;
