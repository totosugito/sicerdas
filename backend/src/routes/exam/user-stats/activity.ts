import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { activityStatsService } from "../../../modules/exam/user-stats/services/activity-stats.service.ts";
import { ActivityQuery, ActivityResponse } from "../../../modules/exam/user-stats/user-stats.schema.ts";

const getActivityStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/activity",
    method: "GET",
    schema: {
      tags: ["Exam User Stats"],
      description: "Get user activity history stats",
      querystring: ActivityQuery,
      response: { 200: ActivityResponse },
    },
    handler: async function handler(
      req: FastifyRequest<{ Querystring: typeof ActivityQuery.static }>,
      reply: FastifyReply,
    ): Promise<typeof ActivityResponse.static> {
      const userId = (req as any).session.user.id;
      const { days = 7 } = req.query;

      const result = await activityStatsService(userId, days);

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.user_stats.activity.success),
        data: result.data!,
      });
    },
  });
};

export default getActivityStatsRoute;
