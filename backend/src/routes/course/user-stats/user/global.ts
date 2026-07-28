import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  GlobalStatsResponse,
  getGlobalStatsService,
} from "../../../../modules/course/user-stats/index.ts";

const globalStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/global",
    method: "GET",
    schema: {
      tags: ["User Course Stats"],
      response: {
        200: GlobalStatsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.session.user.id;
      const result = await getGlobalStatsService(userId);

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.courses.detail.success),
        data: result.data!,
      });
    },
  });
};

export default globalStatsRoute;
