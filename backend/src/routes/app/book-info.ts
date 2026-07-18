import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { bookInfoService } from "../../modules/book/services/book-info.service.ts";
import { BookInfoQuery, BookInfoResponse } from "../../modules/book/book.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const bookInfoRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/book-info",
    method: "GET",
    schema: {
      tags: ["V1/App"],
      summary: "Get book info by ID and total pages security check",
      description: "Returns basic book info if bookId matches and page matches totalPages",
      querystring: BookInfoQuery,
      response: {
        200: BookInfoResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Querystring: typeof BookInfoQuery.static }>,
      reply: FastifyReply,
    ): Promise<typeof BookInfoResponse.static> {
      const { bookId, page } = req.query;

      const result = await bookInfoService(bookId, page);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.detail.success),
        data: result.data,
      });
    },
  });
};

export default bookInfoRoute;
