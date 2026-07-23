import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  getUserStatsService,
  GetUserStatsQuerySchema,
  type GetUserStatsQuery,
  GetUserStatsResponseSchema,
} from "../../../modules/users/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const statsUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/stats",
    method: "GET",
    schema: {
      tags: ["Users Management"],
      summary: "Get user statistics and historical snapshots for Admin Dashboard",
      querystring: GetUserStatsQuerySchema,
      response: {
        200: GetUserStatsResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Querystring: GetUserStatsQuery }>,
      reply: FastifyReply
    ): Promise<typeof GetUserStatsResponseSchema.static> {
      const { periodType, limit } = request.query;

      const result = await getUserStatsService({
        periodType,
        limit,
      });

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.user.management.list.success),
        data: result,
      });
    },
  });
};

export default statsUser;
