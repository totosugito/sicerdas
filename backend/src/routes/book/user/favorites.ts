import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import {
  books,
  bookCategory,
  bookGroup,
  bookEventStats,
  bookInteractions,
} from "../../../db/schema/book/index.ts";
import { educationGrades } from "../../../db/schema/education/grades.ts";
import { and, eq, sql, desc } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getBookCoverUrl } from "../../../utils/book/book-utils.ts";

const FavoriteBookResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  bookId: Type.Number(),
  title: Type.String(),
  author: Type.Optional(Type.String()),
  cover: Type.Object({
    xs: Type.String(),
    lg: Type.String(),
  }),
  category: Type.Object({
    name: Type.String(),
  }),
  grade: Type.Object({
    id: Type.Number(),
    name: Type.String(),
  }),
  stats: Type.Object({
    rating: Type.Number(),
    bookmarkCount: Type.Number(),
    viewCount: Type.Number(),
    downloadCount: Type.Number(),
    isDownloaded: Type.Boolean(),
  }),
  bookmarkedAt: Type.String({ format: "date-time" }),
});

const FavoriteBooksResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Array(FavoriteBookResponseItem),
  pagination: Type.Object({
    total: Type.Number(),
    page: Type.Number(),
    pageSize: Type.Number(),
    totalPages: Type.Number(),
  }),
});

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
      response: {
        200: FavoriteBooksResponse,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{
        Querystring: { page: number; pageSize: number };
      }>,
      reply: FastifyReply,
    ): Promise<typeof FavoriteBooksResponse.static> {
            const userId = (req as any).session.user.id;
      const { page, pageSize } = req.query;
      const offset = (page - 1) * pageSize;

      const whereClause = and(
        eq(bookInteractions.userId, userId),
        eq(bookInteractions.bookmarked, true)
      );

      // 1. Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookInteractions)
        .innerJoin(books, eq(bookInteractions.bookId, books.id))
        .where(whereClause);

      const total = Number(countResult?.count || 0);

      // 2. Get paginated data
      const favorites = await db
        .select({
          id: books.id,
          bookId: books.bookId,
          title: books.title,
          author: books.author,
          categoryName: bookCategory.name,
          grade: {
            id: educationGrades.id,
            name: educationGrades.name,
          },
          rating: bookEventStats.rating,
          bookmarkCount: bookEventStats.bookmarkCount,
          viewCount: bookEventStats.viewCount,
          downloadCount: bookEventStats.downloadCount,
          isDownloaded: sql<boolean>`${bookInteractions.downloadCount} > 0`,
          bookmarkedAt: bookInteractions.updatedAt,
        })
        .from(bookInteractions)
        .innerJoin(books, eq(bookInteractions.bookId, books.id))
        .innerJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .innerJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
        .innerJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
        .leftJoin(bookEventStats, eq(books.id, bookEventStats.bookId))
        .where(whereClause)
        .orderBy(desc(bookInteractions.updatedAt))
        .limit(pageSize)
        .offset(offset);

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.list.success),
        data: favorites.map((item) => ({
          id: item.id,
          bookId: item.bookId,
          title: item.title,
          author: item.author ?? undefined,
          cover: getBookCoverUrl({ bookId: item.bookId }),
          category: {
            name: item.categoryName,
          },
          grade: item.grade,
          stats: {
            rating: item.rating !== null ? parseFloat(item.rating.toString()) : 0,
            bookmarkCount: item.bookmarkCount ?? 0,
            viewCount: item.viewCount ?? 0,
            downloadCount: item.downloadCount ?? 0,
            isDownloaded: !!item.isDownloaded,
          },
          bookmarkedAt: item.bookmarkedAt.toISOString(),
        })),
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    },
  });
};

export default listFavoritesRoute;
