import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { tagStatsService } from "../../../modules/exam/user-stats/services/tag-stats.service.ts";
import { TagStatsResponse } from "../../../modules/exam/user-stats/user-stats.schema.ts";

const getTagStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/tags",
    method: "GET",
    schema: {
      tags: ["Client Exam Analytics"],
      response: { 200: TagStatsResponse },
    },
    handler: async function handler(request: FastifyRequest, reply: FastifyReply): Promise<typeof TagStatsResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await tagStatsService(userId);

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.user_stats.tags.success),
        data: result.data!,
      });
    },
  });
};

export default getTagStatsRoute;
