import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { historyService } from "../../../modules/book/services/user/history.service.ts";
import { HistoryResponse } from "../../../modules/book/book.schema.ts";

const listHistoryRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/history",
    method: "GET",
    schema: {
      tags: ["V1/Book/User"],
      summary: "List user's book reading history",
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        limit: Type.Optional(Type.Number({ minimum: 1, maximum: 20, default: 10 })),
      }),
      response: { 200: HistoryResponse },
    },
    handler: async function handler(
      req: FastifyRequest<{ Querystring: { page: number; limit: number } }>,
      reply: FastifyReply,
    ): Promise<typeof HistoryResponse.static> {
      const userId = (req as any).session.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await historyService(userId, page, limit);

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.list.success),
        data: result.data!,
        pagination: result.pagination!,
      });
    },
  });
};

export default listHistoryRoute;
