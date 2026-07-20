import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  FavoritesQuery,
  FavoritePackagesResponse,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { favoritesService } from "../../../../modules/exam/packages/services/favorites.service.ts";

const listFavoritesRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/favorites",
    method: "GET",
    schema: {
      tags: ["Exam Packages User"],
      summary: "List user's bookmarked exam packages",
      querystring: FavoritesQuery,
      response: {
        200: FavoritePackagesResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{
        Querystring: typeof FavoritesQuery.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof FavoritePackagesResponse.static> {
      const userId = (req as any).session.user.id;

      const result = await favoritesService(req.query, userId);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.packages.favorites.success),
        data: result.data!,
        pagination: result.pagination!,
      });
    },
  });
};

export default listFavoritesRoute;
