import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { FilterParamsResponse } from "../../../modules/exam/packages/packages.schema.ts";
import { filterParamsService } from "../../../modules/exam/packages/services/filter-params.service.ts";

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/filter-params",
    method: "GET",
    schema: {
      tags: ["Exam Packages"],
      summary: "Get filter parameters for exam packages",
      description: "Get all education categories and their grades that have active exam packages",
      response: {
        200: FilterParamsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest,
      reply: FastifyReply,
    ): Promise<typeof FilterParamsResponse.static> {
      const result = await filterParamsService();

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.packages.filterParams.success),
        data: result.data!,
      });
    },
  });
};

export default publicRoute;
