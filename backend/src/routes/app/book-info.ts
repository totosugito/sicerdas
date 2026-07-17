import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { books } from "../../db/schema/book/index.ts";
import { and, eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getBookPdfUrl } from "../../utils/book-utils.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";

const BookInfoQuery = Type.Object({
  bookId: Type.Number(),
  page: Type.Number(),
});

const BookInfoResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    id: Type.String({ format: "uuid" }),
    bookId: Type.Number(),
    title: Type.String(),
    description: Type.Optional(Type.String()),
    author: Type.Optional(Type.String()),
    publishedYear: Type.String(),
    totalPages: Type.Number(),
    size: Type.Number(),
    status: Type.String(),
    pdf: Type.String(),
  }),
});

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
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Querystring: { bookId: number; page: number } }>,
      reply: FastifyReply,
    ): Promise<typeof BookInfoResponse.static> {
      const { t } = getTypedI18n(req);
      const { bookId, page } = req.query;

      // Select book from database matching bookId and totalPages = page
      const result = await db
        .select({
          id: books.id,
          bookId: books.bookId,
          title: books.title,
          description: books.description,
          author: books.author,
          publishedYear: books.publishedYear,
          totalPages: books.totalPages,
          size: books.size,
          status: books.status,
        })
        .from(books)
        .where(
          and(
            eq(books.bookId, bookId),
            eq(books.totalPages, page),
          ),
        )
        .limit(1);

      if (!result || result.length === 0) {
        return reply.notFound(t(($) => $.book.detail.notFound));
      }

      const book = result[0];

      const processedBook = {
        id: book.id,
        bookId: book.bookId,
        title: book.title,
        description: book.description || undefined,
        author: book.author || undefined,
        publishedYear: book.publishedYear,
        totalPages: book.totalPages,
        size: book.size,
        status: book.status,
        pdf: getBookPdfUrl({ bookId: book.bookId }),
      };

      return reply.status(200).send({
        success: true,
        message: t(($) => $.book.detail.success),
        data: processedBook,
      });
    },
  });
};

export default bookInfoRoute;
