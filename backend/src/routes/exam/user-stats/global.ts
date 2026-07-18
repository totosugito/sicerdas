import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { globalStatsService } from "../../../modules/exam/user-stats/services/global-stats.service.ts";
import { GlobalStatsResponse } from "../../../modules/exam/user-stats/user-stats.schema.ts";

const getGlobalStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/global",
    method: "GET",
    schema: {
      tags: ["Client Exam Analytics"],
      response: { 200: GlobalStatsResponse },
    },
    handler: async function handler(request: FastifyRequest, reply: FastifyReply): Promise<typeof GlobalStatsResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await globalStatsService(userId);

      const message = result.data === null
        ? request.t(($) => $.exam.user_stats.global.notFound)
        : request.t(($) => $.exam.user_stats.global.success);

      return reply.status(200).send({
        success: true,
        message,
        data: result.data ?? null,
      });
    },
  });
};

export default getGlobalStatsRoute;
