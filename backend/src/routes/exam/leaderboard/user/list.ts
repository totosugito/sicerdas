import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listLeaderboardService } from "../../../../modules/exam/leaderboard/services/list-leaderboard.service.ts";
import { LeaderboardBody, LeaderboardResponse } from "../../../../modules/exam/leaderboard/leaderboard.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const leaderboardRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "GET",
    schema: {
      tags: ["Client Exam Leaderboard"],
      querystring: LeaderboardBody,
      response: {
        200: LeaderboardResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Querystring: typeof LeaderboardBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof LeaderboardResponse.static> {
      const result = await listLeaderboardService(request.query);

      if (!result.success) {
        return reply.status(result.statusCode || 500).send({
          success: false,
          message: result.errorKey ? request.t(result.errorKey) : request.t(($) => $.exam.leaderboard.list.error),
        });
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.leaderboard.list.success),
        data: result.data || [],
      });
    },
  });
};

export default leaderboardRoute;
