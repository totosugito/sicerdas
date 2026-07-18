import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { EnumContentType } from "../../db/schema/enum/enum-app.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { detailBookService } from "../../modules/book/services/detail-book.service.ts";
import { BookDetailResponse } from "../../modules/book/book.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:bookId",
    method: "GET",
    schema: {
      tags: ["V1/Book"],
      summary: "Get book detail",
      description: "Get detailed information about a specific book by its ID",
      params: Type.Object({ bookId: Type.Number() }),
      response: { 200: BookDetailResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: { bookId: number } }>,
      reply: FastifyReply,
    ): Promise<typeof BookDetailResponse.static> {
      const { bookId } = req.params;
      const session = await getAuthInstance(app).api.getSession({ headers: fromNodeHeaders(req.headers) });
      const userId = session?.user?.id || null;
      const latestVersionId = app.versionCache.get(EnumContentType.BOOK) ?? undefined;
      const sessionId = req.cookies?.sessionId || null;

      const result = await detailBookService(bookId, userId, latestVersionId, req.ip, req.headers["user-agent"], sessionId);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.detail.success),
        data: result.data,
      });
    },
  });
};

export default publicRoute;
