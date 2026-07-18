import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { filterParamsService } from "../../modules/book/services/filter-params.service.ts";
import { FilterParamsResponse } from "../../modules/book/book.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/filter-params",
    method: "GET",
    schema: {
      tags: ["V1/Book"],
      summary: "Get filter parameters",
      description: "Get all book categories with their associated groups and statistics",
      response: { 200: FilterParamsResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      req: FastifyRequest,
      reply: FastifyReply,
    ): Promise<typeof FilterParamsResponse.static> {
      const result = await filterParamsService();

      if (!result.success || !result.data) {
        return reply.internalServerError(req.t(($) => $.book.filterParams.error));
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.filterParams.success),
        data: result.data,
      });
    },
  });
};

export default publicRoute;
