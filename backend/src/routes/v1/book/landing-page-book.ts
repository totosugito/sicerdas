import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {Type} from '@sinclair/typebox';
import {withErrorHandler} from "../../../utils/withErrorHandler.ts";
import {db} from "../../../db/index.ts";
import { books, bookCategory, bookGroup, bookEventStats, userBookInteractions } from "../../../db/schema/book-schema.ts";
import { educationGrades } from "../../../db/schema/education-schema.ts";
import {and, eq, desc, sql, gt} from "drizzle-orm";
import type {FastifyReply, FastifyRequest} from "fastify";

const LandingPageQuery = Type.Object({
  limit: Type.Optional(Type.Number({default: 10, minimum: 1, maximum: 20})),
});

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
  createdAt: Type.String({format: 'date-time'}),
  updatedAt: Type.String({format: 'date-time'}),
});

const LandingPageResponse = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    latestBooks: Type.Array(BookResponse),
    bestRatedBooks: Type.Array(BookResponse),
    mostViewedBooks: Type.Array(BookResponse),
    limit: Type.Number(),
  }),
});

// Define types for our book data
interface UserInteraction {
  liked: boolean | null;
  disliked: boolean | null;
  rating: string | number | null;
  bookmarked: boolean | null;
}

interface BookData {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  publishedYear: string;
  totalPages: number;
  size: number;
  status: string;
  rating: number | string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  category: {
    id: number;
    name: string;
  } | null;
  group: {
    id: number;
    name: string;
  } | null;
  grade: {
    id: number;
    name: string;
    grade: string;
  } | null;
  userInteraction?: UserInteraction | null;
}

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/landing-page',
    method: 'POST',
    schema: {
      tags: ['V1/Book'],
      summary: 'Get landing page book data',
      description: 'Get all book data needed for the landing page including latest, best rated, and most viewed books',
      body: LandingPageQuery,
      response: {
        200: LandingPageResponse,
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Body: typeof LandingPageQuery.static }>,
      reply: FastifyReply
    ): Promise<typeof LandingPageResponse.static> {
      const {limit = 10} = req.body;
      
      // Check if user is logged in
      const isLoggedIn = !!(req.session?.user);
      const userId = isLoggedIn ? req.session.user.id : null;

      // Function to process books with optional user interaction data
      const processBookData = (items: any[], includeUserInteraction: boolean = false) => {
        return items.map(item => {
          // Flatten the Drizzle ORM result structure
          const flattenedItem: BookData = {
            id: item.books?.id || item.id,
            title: item.books?.title || item.title,
            description: item.books?.description || item.description,
            author: item.books?.author || item.author,
            publishedYear: item.books?.publishedYear || item.publishedYear,
            totalPages: item.books?.totalPages || item.totalPages,
            size: item.books?.size || item.size,
            status: item.books?.status || item.status,
            rating: item.bookEventStats?.rating || item.rating,
            createdAt: item.books?.createdAt || item.createdAt,
            updatedAt: item.books?.updatedAt || item.updatedAt,
            category: item.bookCategory ? {
              id: item.bookCategory.id,
              name: item.bookCategory.name
            } : (item.category || null),
            group: item.bookGroup ? {
              id: item.bookGroup.id,
              name: item.bookGroup.name
            } : (item.group || null),
            grade: item.educationGrade ? {
              id: item.educationGrade.id,
              name: item.educationGrade.name,
              grade: item.educationGrade.grade
            } : (item.grade || null),
            userInteraction: includeUserInteraction ? (item.userBookInteractions || null) : undefined
          };
          
          const processedItem = {
            ...flattenedItem,
            createdAt: flattenedItem.createdAt ? flattenedItem.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: flattenedItem.updatedAt ? flattenedItem.updatedAt.toISOString() : new Date().toISOString(),
          };
          
          // Add user interaction data if user is logged in
          if (includeUserInteraction) {
            return {
              ...processedItem,
              userInteraction: flattenedItem.userInteraction ? {
                liked: flattenedItem.userInteraction.liked ?? false,
                disliked: flattenedItem.userInteraction.disliked ?? false,
                rating: flattenedItem.userInteraction.rating ? parseFloat(flattenedItem.userInteraction.rating.toString()) : 0,
                bookmarked: flattenedItem.userInteraction.bookmarked ?? false,
              } : {
                liked: false,
                disliked: false,
                rating: 0,
                bookmarked: false,
              }
            };
          }
          
          return processedItem;
        });
      };

      // Helper function to build base select query
      const buildBaseSelect = (includeRating: boolean = false, includeUserInteraction: boolean = false, userId: string | null = null) => {
        const baseSelect: any = {
          id: books.id,
          title: books.title,
          description: books.description,
          author: books.author,
          publishedYear: books.publishedYear,
          totalPages: books.totalPages,
          size: books.size,
          status: books.status,
          rating: includeRating ? bookEventStats.rating : sql<number | null>`NULL`.as('rating'),
          createdAt: books.createdAt,
          updatedAt: books.updatedAt,
          category: sql`json_build_object('id', ${bookCategory.id}, 'name', ${bookCategory.name})`.as('category'),
          group: sql`json_build_object('id', ${bookGroup.id}, 'name', ${bookGroup.name})`.as('group'),
          grade: sql`json_build_object('id', ${educationGrades.id}, 'name', ${educationGrades.name}, 'grade', ${educationGrades.grade})`.as('grade'),
        };
        
        // Add user interaction data if user is logged in
        if (includeUserInteraction && userId) {
          baseSelect.userInteraction = sql`json_build_object(
            'liked', ${userBookInteractions.liked},
            'disliked', ${userBookInteractions.disliked},
            'rating', ${userBookInteractions.rating},
            'bookmarked', ${userBookInteractions.bookmarked}
          )`.as('userInteraction');
        }
        
        return baseSelect;
      };

      // Get latest books
      let latestBooksQuery = db
        .select(buildBaseSelect(false, isLoggedIn, userId))
        .from(books)
        .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
        .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id));
        
      // Add user interaction join if user is logged in
      if (isLoggedIn && userId) {
        latestBooksQuery = latestBooksQuery
          .leftJoin(userBookInteractions, and(
            eq(books.id, userBookInteractions.bookId),
            eq(userBookInteractions.userId, userId)
          ));
      }
      
      const latestBooks = await latestBooksQuery
        .where(eq(books.status, 'published'))
        .orderBy(desc(books.createdAt))
        .limit(limit);

      // Get best rated books
      let bestRatedBooksQuery = db
        .select(buildBaseSelect(true, isLoggedIn, userId))
        .from(books)
        .innerJoin(bookEventStats, eq(books.id, bookEventStats.bookId))
        .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
        .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id));
        
      // Add user interaction join if user is logged in
      if (isLoggedIn && userId) {
        bestRatedBooksQuery = bestRatedBooksQuery
          .leftJoin(userBookInteractions, and(
            eq(books.id, userBookInteractions.bookId),
            eq(userBookInteractions.userId, userId)
          ));
      }
      
      const bestRatedBooks = await bestRatedBooksQuery
        .where(and(
          eq(books.status, 'published'),
          gt(bookEventStats.rating, '0')
        ))
        .orderBy(desc(bookEventStats.rating))
        .limit(limit);

      // Get most viewed books
      let mostViewedBooksQuery = db
        .select(buildBaseSelect(false, isLoggedIn, userId))
        .from(books)
        .innerJoin(bookEventStats, eq(books.id, bookEventStats.bookId))
        .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
        .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id));
        
      // Add user interaction join if user is logged in
      if (isLoggedIn && userId) {
        mostViewedBooksQuery = mostViewedBooksQuery
          .leftJoin(userBookInteractions, and(
            eq(books.id, userBookInteractions.bookId),
            eq(userBookInteractions.userId, userId)
          ));
      }
      
      const mostViewedBooks = await mostViewedBooksQuery
        .where(eq(books.status, 'published'))
        .orderBy(desc(bookEventStats.viewCount))
        .limit(limit);

      return reply.status(200).send({
        success: true,
        data: {
          latestBooks: processBookData(latestBooks, isLoggedIn),
          bestRatedBooks: processBookData(bestRatedBooks, isLoggedIn),
          mostViewedBooks: processBookData(mostViewedBooks, isLoggedIn),
          limit,
        },
      });
    }),
  });
};

export default publicRoute;