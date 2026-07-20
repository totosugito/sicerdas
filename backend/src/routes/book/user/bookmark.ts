import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { bookmarkService } from "../../../modules/book/services/user/bookmark.service.ts";
import { BookmarkBody, BookmarkResponse } from "../../../modules/book/book.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const userBookmarkRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/bookmark",
    method: "POST",
    schema: {
      tags: ["V1/Book/User"],
      summary: "Update book bookmark status",
      description: "Set or unset a bookmark for a specific book",
      body: BookmarkBody,
      response: { 200: BookmarkResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof BookmarkBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof BookmarkResponse.static> {
      const userId = (req as any).session.user.id;
      const { bookId, bookmarked } = req.body;

      const result = await bookmarkService(userId, bookId, bookmarked);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(bookmarked ? ($) => $.book.bookmark.updated : ($) => $.book.bookmark.noChange),
        data: result.data,
      });
    },
  });
};

export default userBookmarkRoute;
