import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { books, bookCategory, bookGroup, bookEventStats, userBookInteractions } from "../../../db/schema/book-schema.ts";
import { educationGrades } from "../../../db/schema/education-schema.ts";
import { and, eq } from "drizzle-orm";
import type { FastifyRequest, FastifyReply } from "fastify";

const BookResponse = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  publishedYear: Type.String(),
  totalPages: Type.Number(),
  size: Type.Number(),
  status: Type.String(),
  rating: Type.Optional(Type.Number()),
  viewCount: Type.Optional(Type.Number()),
  category: Type.Object({
    id: Type.Number(),
    name: Type.String(),
  }),
  group: Type.Object({
    id: Type.Number(),
    name: Type.String(),
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
  })),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id',
    method: 'GET',
    schema: {
      tags: ['V1/Book'],
      summary: 'Get book details',
      description: 'Get detailed information about a specific book by ID including ratings and view counts',
      params: Type.Object({
        id: Type.String({ format: 'uuid', description: 'UUID of the book to retrieve' })
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: BookResponse
        }),
        404: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        })
      },
    },
    handler: withErrorHandler(async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = req.params;
      
      // Check if user is logged in
      const isLoggedIn = !!(req.session?.user);
      const userId = isLoggedIn ? req.session.user.id : null;

      // Helper function to build base select query
      const buildBaseSelect = (includeUserInteraction: boolean = false, userId: string | null = null) => {
        const baseSelect: any = {
          id: books.id,
          title: books.title,
          description: books.description,
          author: books.author,
          publishedYear: books.publishedYear,
          totalPages: books.totalPages,
          size: books.size,
          status: books.status,
          rating: bookEventStats.rating,
          viewCount: bookEventStats.viewCount,
          createdAt: books.createdAt,
          updatedAt: books.updatedAt,
          category: {
            id: bookCategory.id,
            name: bookCategory.name,
          },
          group: {
            id: bookGroup.id,
            name: bookGroup.name,
          },
          grade: {
            id: educationGrades.id,
            name: educationGrades.name,
            grade: educationGrades.grade,
          },
        };
        
        // Add user interaction data if user is logged in
        if (includeUserInteraction && userId) {
          baseSelect.liked = userBookInteractions.liked;
          baseSelect.disliked = userBookInteractions.disliked;
          baseSelect.userRating = userBookInteractions.rating;
          baseSelect.bookmarked = userBookInteractions.bookmarked;
        }
        
        return baseSelect;
      };

      // Build the query using the base select
      let bookQuery = db
        .select(buildBaseSelect(isLoggedIn, userId))
        .from(books)
        .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
        .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
        .leftJoin(bookEventStats, eq(books.id, bookEventStats.bookId));
        
      // Add user interaction join if user is logged in
      if (isLoggedIn && userId) {
        bookQuery = bookQuery
          .leftJoin(userBookInteractions, and(
            eq(books.id, userBookInteractions.bookId),
            eq(userBookInteractions.userId, userId)
          ));
      }
      
      const [result] = await bookQuery
        .where(
          and(
            eq(books.id, id),
            eq(books.status, 'published'),
          )
        )
        .limit(1);

      if (!result) {
        return reply.status(404).send({
          success: false,
          message: 'Book not found',
        });
      }

      // Format dates to ISO strings and add user interaction data if user is logged in
      const response: any = {
        id: result.books?.id,
        title: result.books?.title,
        description: result.books?.description,
        author: result.books?.author,
        publishedYear: result.books?.publishedYear,
        totalPages: result.books?.totalPages,
        size: result.books?.size,
        status: result.books?.status,
        rating: result.book_event_stats?.rating,
        viewCount: result.book_event_stats?.viewCount,
        category: result.book_category,
        group: result.book_group,
        grade: result.education_grade,
        createdAt: result.books?.createdAt ? result.books.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: result.books?.updatedAt ? result.books.updatedAt.toISOString() : new Date().toISOString(),
      };

      // Add user interaction data if user is logged in
      if (isLoggedIn && 'liked' in result) {
        response.userInteraction = {
          liked: (result as any).liked !== undefined ? (result as any).liked : false,
          disliked: (result as any).disliked !== undefined ? (result as any).disliked : false,
          rating: (result as any).userRating !== undefined ? parseFloat((result as any).userRating.toString()) : 0,
          bookmarked: (result as any).bookmarked !== undefined ? (result as any).bookmarked : false,
        };
      }

      return reply.status(200).send({
        success: true,
        data: response,
      });
    }),
  });
};

export default publicRoute;