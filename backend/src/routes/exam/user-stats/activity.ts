import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import { examSessions } from "../../../db/schema/exam/index.ts";
import { eq, and, gte, sql } from "drizzle-orm";

const ActivityHistoryResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Array(
    Type.Object({
      date: Type.String(),
      totalQuestions: Type.Number(),
      totalCorrect: Type.Number(),
      totalWrong: Type.Number(),
      totalSessions: Type.Number(),
    })
  ),
});

const getActivityStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "/activity",
    {
      schema: {
        tags: ["Exam User Stats"],
        description: "Get user activity history stats",
        querystring: Type.Object({
          days: Type.Optional(Type.Number({ default: 7 })),
        }),
        response: {
          200: ActivityHistoryResponse,
        },
      },
    },
    async (req, reply) => {
      const userId = (req as any).session.user.id;
      const { days = 7 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Query to aggregate stats by date
      // We use SQL template literals to handle date truncation in Postgres
      const stats = await db
        .select({
          date: sql<string>`TO_CHAR(${examSessions.startTime}, 'YYYY-MM-DD')`,
          totalCorrect: sql<number>`SUM(${examSessions.totalCorrect})::int`,
          totalWrong: sql<number>`SUM(${examSessions.totalWrong})::int`,
          totalSkipped: sql<number>`SUM(${examSessions.totalSkipped})::int`,
          totalSessions: sql<number>`COUNT(${examSessions.id})::int`,
        })
        .from(examSessions)
        .where(
          and(
            eq(examSessions.userId, userId),
            gte(examSessions.startTime, startDate)
          )
        )
        .groupBy(sql`TO_CHAR(${examSessions.startTime}, 'YYYY-MM-DD')`)
        .orderBy(sql`TO_CHAR(${examSessions.startTime}, 'YYYY-MM-DD')`);

      const formattedData = stats.map((row: any) => ({
        date: row.date,
        totalQuestions: row.totalCorrect + row.totalWrong + row.totalSkipped,
        totalCorrect: row.totalCorrect,
        totalWrong: row.totalWrong,
        totalSessions: row.totalSessions,
      }));

      return reply.send({
        success: true,
        message: "Activity stats retrieved successfully",
        data: formattedData,
      });
    }
  );
};

export default getActivityStatsRoute;
