import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { userStatsService } from "../../../modules/book/services/user-stats.service.ts";
import { UserStatsResponse } from "../../../modules/book/book.schema.ts";

const getBookStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/stats",
    method: "GET",
    schema: {
      tags: ["V1/Book/User"],
      summary: "Get user's book interaction statistics",
      response: { 200: UserStatsResponse },
    },
    handler: async function handler(
      req: FastifyRequest,
      reply: FastifyReply,
    ): Promise<typeof UserStatsResponse.static> {
      const userId = (req as any).session.user.id;
      const result = await userStatsService(userId);

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.list.success),
        data: result.data!,
      });
    },
  });
};

export default getBookStatsRoute;
