import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { updateAllGroupStatsService } from "../../../modules/book/services/update-all-group-stats.service.ts";
import { AllGroupStatsResponse } from "../../../modules/book/book.schema.ts";

const adminRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update-all-group-stats",
    method: "POST",
    schema: {
      tags: ["Admin/Book"],
      summary: "Update all book group statistics",
      description: "Recalculate and update the book total count for all book groups",
      response: { 200: AllGroupStatsResponse },
    },
    handler: async function handler(
      req: FastifyRequest,
      reply: FastifyReply,
    ): Promise<typeof AllGroupStatsResponse.static> {
      const result = await updateAllGroupStatsService();

      if (!result.success || !result.data) {
        return reply.internalServerError(req.t(($) => $.book.groupStats.updateAllSuccess));
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.groupStats.updateAllSuccess),
        data: result.data,
      });
    },
  });
};

export default adminRoute;
