import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  CategoryStatsResponse,
  getCategoryStatsService,
} from "../../../../modules/course/user-stats/index.ts";

const categoriesStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/categories",
    method: "GET",
    schema: {
      tags: ["User Course Stats"],
      response: {
        200: CategoryStatsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.session.user.id;
      const result = await getCategoryStatsService(userId);

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.courses.detail.success),
        data: result.data!,
      });
    },
  });
};

export default categoriesStatsRoute;
