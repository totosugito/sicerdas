import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  FavoritesQuerySchema,
  FavoritesResponse,
  getFavoritesService,
} from "../../../../modules/course/interactions/index.ts";

const favoritesRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/favorites",
    method: "GET",
    schema: {
      tags: ["User Course Interactions"],
      querystring: FavoritesQuerySchema,
      response: {
        200: FavoritesResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Querystring: typeof FavoritesQuerySchema.static }>,
      reply: FastifyReply,
    ) {
      const userId = request.session.user.id;
      const { page = 1, limit = 10 } = request.query;

      const result = await getFavoritesService(userId, page, limit);

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.courses.list.success),
        data: result.data!,
      });
    },
  });
};

export default favoritesRoute;
