import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyRequest, FastifyReply } from "fastify";
import { listModelStatsService } from "../../../../modules/ai/services/list-model-stats.service.ts";
import { StatsQuery, ListModelStatsResponse } from "../../../../modules/ai/ai.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const modelsAiStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/models/stats",
    method: "GET",
    schema: {
      tags: ["Chat AI"],
      querystring: StatsQuery,
      response: {
        200: ListModelStatsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Querystring: typeof StatsQuery.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListModelStatsResponse.static> {
      const result = await listModelStatsService(req.query);

      if (!result.success || !result.data) {
        return reply.internalServerError(req.t(($) => $.chatAi.model.stats.success));
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.chatAi.model.stats.success),
        data: result.data,
        meta: result.meta!,
      });
    },
  });
};

export default modelsAiStatsRoute;
