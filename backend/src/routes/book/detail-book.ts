import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { books, bookCategory, bookGroup, bookEventStats, userBookInteractions } from "../../db/schema/book-schema.ts";
import { educationGrades } from "../../db/schema/education-schema.ts";
import { userEventHistory } from "../../db/schema/web-schema.ts";
import { and, eq, sql } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getBookCoverUrl, getBookPdfUrl, getBookSamplePagesUrl } from "../../utils/book-utils.ts";

const BookDetailResponse = Type.Object({
  id: Type.String({ format: 'uuid' }),
  bookId: Type.Number(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  publishedYear: Type.String(),
  totalPages: Type.Number(),
  size: Type.Number(),
  status: Type.String(),
  rating: Type.Optional(Type.Number()),
  viewCount: Type.Optional(Type.Number()),
  downloadCount: Type.Optional(Type.Number()),
  cover: Type.Object({
    xs: Type.String(),
    lg: Type.String(),
  }),
  pdf: Type.String(),
  samples: Type.Object({
    xs: Type.String(),
    lg: Type.String(),
  }),
  category: Type.Object({
    id: Type.Number(),
    name: Type.String(),
  }),
  group: Type.Object({
    id: Type.Number(),
    name: Type.String(),
    shortName: Type.String(),
  }),
  grade: Type.Object({
    id: Type.Number(),
    name: Type.String(),
    grade: Type.String(),
  }),
  // User interaction data (only present when user is logged in)
  userInteraction: Type.Optional(Type.Object({
    liked: Type.Boolean(),
    disliked: Type.Boolean(),
    rating: Type.Number(),
    bookmarked: Type.Boolean(),
    viewCount: Type.Number(),
    downloadCount: Type.Number(),
  })),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

const BookDetailResponseWrapper = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: BookDetailResponse,
});

const BookNotFoundResponse = Type.Object({
  success: Type.Boolean({ default: false }),
  message: Type.String()
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/detail/:bookId',
    method: 'GET',
    schema: {
      tags: ['V1/Book'],
      summary: 'Get book detail',
      description: 'Get detailed information about a specific book by its ID',
      params: Type.Object({
        bookId: Type.Number(),
      }),
      response: {
        200: BookDetailResponseWrapper,
        '4xx': BookNotFoundResponse,
        '5xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        })
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Params: { bookId: number } }>,
      reply: FastifyReply
    ): Promise<typeof BookDetailResponseWrapper.static> {
      const { bookId } = req.params;

      // Check if user is logged in
      const isLoggedIn = !!(req.session?.user);
      const userId = isLoggedIn ? req.session.user.id : null;

      // Build the base query with joins
      let baseQuery;

      if (isLoggedIn && userId) {
        // Query with user interactions
        baseQuery = db
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
            rating: bookEventStats.rating,
            viewCount: bookEventStats.viewCount,
            downloadCount: bookEventStats.downloadCount,
            createdAt: books.createdAt,
            updatedAt: books.updatedAt,
            category: {
              id: bookCategory.id,
              name: bookCategory.name,
            },
            group: {
              id: bookGroup.id,
              name: bookGroup.name,
              shortName: bookGroup.shortName,
            },
            grade: {
              id: educationGrades.id,
              name: educationGrades.name,
              grade: educationGrades.grade,
            },
            // User interaction data
            liked: userBookInteractions.liked,
            disliked: userBookInteractions.disliked,
            userRating: userBookInteractions.rating,
            bookmarked: userBookInteractions.bookmarked,
            userViewCount: userBookInteractions.viewCount,
            userDownloadCount: userBookInteractions.downloadCount,
          })
          .from(books)
          .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
          .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
          .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
          .leftJoin(bookEventStats, eq(books.id, bookEventStats.bookId))
          .leftJoin(userBookInteractions, and(
            eq(books.id, userBookInteractions.bookId),
            eq(userBookInteractions.userId, userId)
          ))
          .where(eq(books.bookId, bookId)); // Filter by the specific book ID
      } else {
        // Query without user interactions
        baseQuery = db
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
            rating: bookEventStats.rating,
            viewCount: bookEventStats.viewCount,
            downloadCount: bookEventStats.downloadCount,
            createdAt: books.createdAt,
            updatedAt: books.updatedAt,
            category: {
              id: bookCategory.id,
              name: bookCategory.name,
            },
            group: {
              id: bookGroup.id,
              name: bookGroup.name,
              shortName: bookGroup.shortName,
            },
            grade: {
              id: educationGrades.id,
              name: educationGrades.name,
              grade: educationGrades.grade,
            },
            // Placeholder values for user interactions when not logged in
            liked: sql<boolean | null>`NULL`.as('liked'),
            disliked: sql<boolean | null>`NULL`.as('disliked'),
            userRating: sql<string | null>`NULL`.as('userRating'),
            bookmarked: sql<boolean | null>`NULL`.as('bookmarked'),
            userViewCount: sql<number | null>`NULL`.as('userViewCount'),
            userDownloadCount: sql<number | null>`NULL`.as('userDownloadCount'),
          })
          .from(books)
          .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
          .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
          .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
          .leftJoin(bookEventStats, eq(books.id, bookEventStats.bookId))
          .where(eq(books.bookId, bookId)); // Filter by the specific book ID
      }

      const result = await baseQuery;

      if (!result || result.length === 0) {
        return reply.status(404).send({
          success: false,
          message: req.i18n.t('book.detail.notFound')
        });
      }

      const book = result[0];

      const processedBook = {
        id: book.id,
        bookId: book.bookId,
        title: book.title,
        description: book.description,
        author: book.author,
        publishedYear: book.publishedYear,
        totalPages: book.totalPages,
        size: book.size,
        status: book.status,
        rating: book.rating !== null ? parseFloat(book.rating.toString()) : undefined,
        viewCount: book.viewCount !== null ? book.viewCount : undefined,
        downloadCount: book.downloadCount !== null ? book.downloadCount : undefined,
        cover: getBookCoverUrl({ bookId: book.bookId }),
        pdf: getBookPdfUrl({ bookId: book.bookId }),
        samples: getBookSamplePagesUrl({ bookId: book.bookId }),
        category: book.category ? {
          id: book.category.id,
          name: book.category.name,
        } : {
          id: 0,
          name: '',
        },
        group: book.group ? {
          id: book.group.id,
          name: book.group.name,
          shortName: book.group.shortName
        } : {
          id: 0,
          name: '',
        },
        grade: book.grade ? {
          id: book.grade.id,
          name: book.grade.name,
          grade: book.grade.grade,
        } : {
          id: 0,
          name: '',
          grade: '',
        },
        createdAt: book.createdAt ? book.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: book.updatedAt ? book.updatedAt.toISOString() : new Date().toISOString(),
      };

      // Update view count if user is logged in
      if (isLoggedIn && userId) {
        await db.insert(userBookInteractions)
          .values({
            userId,
            bookId: book.id, // Using UUID
            viewCount: 1,
            liked: false,
            disliked: false,
            bookmarked: false,
            rating: '0.00',
            downloadCount: 0
          })
          .onConflictDoUpdate({
            target: [userBookInteractions.userId, userBookInteractions.bookId],
            set: {
              viewCount: sql`${userBookInteractions.viewCount} + 1`,
              updatedAt: new Date()
            }
          });
      } else {
        // Log guest view
        const sessionId = req.cookies?.sessionId || null; // Assuming sessionId might be in cookies
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        await db.insert(userEventHistory).values({
          userId: null,
          referenceId: book.id,
          contentType: 'book',
          action: 'view',
          sessionId: sessionId ? sessionId : undefined, // Check if uuid valid? let's assume valid or undefined
          ipAddress,
          userAgent
        });
      }

      // Add user interaction data if user is logged in
      if (isLoggedIn && book.liked !== undefined) {
        return reply.status(200).send({
          success: true,
          message: req.i18n.t('book.detail.success'),
          data: {
            ...processedBook,
            userInteraction: {
              liked: book.liked !== undefined && book.liked !== null ? book.liked : false,
              disliked: book.disliked !== undefined && book.disliked !== null ? book.disliked : false,
              rating: book.userRating !== undefined && book.userRating !== null ? parseFloat(book.userRating.toString()) : 0,
              bookmarked: book.bookmarked !== undefined && book.bookmarked !== null ? book.bookmarked : false,
              viewCount: book.userViewCount !== undefined && book.userViewCount !== null ? book.userViewCount : 0,
              downloadCount: book.userDownloadCount !== undefined && book.userDownloadCount !== null ? book.userDownloadCount : 0,
            }
          }
        });
      }

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('book.detail.success'),
        data: processedBook
      });
    }),
  });
};

export default publicRoute;