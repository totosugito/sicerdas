import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  UpdateBookmarkBody,
  BookmarkResponse,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { bookmarkService } from "../../../../modules/exam/packages/services/user/bookmark.service.ts";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/bookmark",
    method: "POST",
    schema: {
      tags: ["Exam Packages User"],
      summary: "Update exam package bookmark status",
      description: "Set or unset a bookmark for a specific exam package",
      body: UpdateBookmarkBody,
      response: {
        200: BookmarkResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof UpdateBookmarkBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof BookmarkResponse.static> {
      const userId = (req as any).session.user.id;

      const result = await bookmarkService(req.body, userId);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.packages.bookmark.updated),
        data: result.data!,
      });
    },
  });
};

export default protectedRoute;
