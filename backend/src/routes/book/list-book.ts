import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { EnumContentType } from "../../db/schema/enum/enum-app.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { listBookService } from "../../modules/book/services/list-book.service.ts";
import { BookListBody, BookListResponse } from "../../modules/book/book.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["V1/Book"],
      summary: "List books",
      description: "Get a paginated list of books with filtering and sorting options",
      body: BookListBody,
      response: { 200: BookListResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof BookListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof BookListResponse.static> {
      const session = await getAuthInstance(app).api.getSession({ headers: fromNodeHeaders(req.headers) });
      const userId = session?.user?.id || null;
      const latestVersionId = app.versionCache.get(EnumContentType.BOOK) ?? undefined;

      const result = await listBookService(req.body, userId, latestVersionId);

      if (!result.success || !result.data) {
        return reply.internalServerError(req.t(($) => $.book.list.success));
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.list.success),
        data: result.data,
      });
    },
  });
};

export default publicRoute;
