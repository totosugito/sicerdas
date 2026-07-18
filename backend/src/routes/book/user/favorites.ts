import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { favoritesService } from "../../../modules/book/services/favorites.service.ts";
import { FavoritesResponse } from "../../../modules/book/book.schema.ts";

const listFavoritesRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/favorites",
    method: "GET",
    schema: {
      tags: ["V1/Book/User"],
      summary: "List user's bookmarked books",
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        pageSize: Type.Optional(Type.Number({ minimum: 1, maximum: 20, default: 10 })),
      }),
      response: { 200: FavoritesResponse },
    },
    handler: async function handler(
      req: FastifyRequest<{ Querystring: { page: number; pageSize: number } }>,
      reply: FastifyReply,
    ): Promise<typeof FavoritesResponse.static> {
      const userId = (req as any).session.user.id;
      const { page = 1, pageSize = 10 } = req.query;

      const result = await favoritesService(userId, page, pageSize);

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.list.success),
        data: result.data!,
        pagination: result.pagination!,
      });
    },
  });
};

export default listFavoritesRoute;
