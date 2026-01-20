import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/index.ts";
import { books, bookCategory, bookGroup, bookEventStats, userBookInteractions } from "../../db/schema/book-schema.ts";
import { educationGrades } from "../../db/schema/education-schema.ts";
import { and, eq, inArray, sql, or, ilike, desc } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { EnumContentStatus, EnumContentType } from "../../db/schema/enum-app.ts";
import { appVersion } from "../../db/schema/version-schema.ts";

const BookListQuery = Type.Object({
  category: Type.Optional(Type.Array(Type.Number())),
  group: Type.Optional(Type.Array(Type.Number())),
  grade: Type.Optional(Type.Array(Type.Number())),
  search: Type.Optional(Type.String({ description: 'Search term for book title or author' })),
  sortBy: Type.Optional(Type.String({ description: 'Sort field: createdAt, title, rating, viewCount', default: 'createdAt' })),
  sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'desc' })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 20 })),
});

const BookResponse = Type.Object({
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
  })),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

const BookListResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(BookResponse),
    total: Type.Number(),
    page: Type.Number(),
    limit: Type.Number(),
    totalPages: Type.Number(),
  }),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/list',
    method: 'POST',
    schema: {
      tags: ['V1/Book'],
      summary: 'List books',
      description: 'Get a paginated list of books with filtering and sorting options',
      body: BookListQuery,
      response: {
        200: BookListResponse,
        '4xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        }),
        '5xx': Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String()
        })
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Body: typeof BookListQuery.static }>,
      reply: FastifyReply
    ): Promise<typeof BookListResponse.static> {
      const { category, group, grade, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.body;
      const offset = (page - 1) * limit;

      // Check if user is logged in
      const isLoggedIn = !!(req.session?.user);
      const userId = isLoggedIn ? req.session.user.id : null;

      // Helper function to build base select query
      const buildBaseSelect = (includeStats: boolean = false, includeUserInteraction: boolean = false, userId: string | null = null) => {
        const baseSelect: any = {
          id: books.id,
          bookId: books.bookId,
          title: books.title,
          description: books.description,
          author: books.author,
          publishedYear: books.publishedYear,
          totalPages: books.totalPages,
          size: books.size,
          status: books.status,
          rating: includeStats ? bookEventStats.rating : sql<number | null>`NULL`.as('rating'),
          viewCount: includeStats ? bookEventStats.viewCount : sql<number | null>`NULL`.as('viewCount'),
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

      // Build the base query
      // Start with base conditions that are always applied
      const conditions = [];
      conditions.push(eq(books.status, 'published'));

      // Add search condition if search term is provided
      if (search && search.trim() !== '') {
        const searchTerm: string = `%${search.trim().toLowerCase()}%`;

        conditions.push(
          or(
            ilike(books.title, searchTerm),
            ilike(books.author, searchTerm)
          )
        );
      }

      // Add filter conditions if they exist
      if (category?.length) {
        // Only use the first category if multiple categories are provided
        const categoryFilter = category.length > 1 ? [category[0]] : category;

        if (categoryFilter[0] === 0) {
          // When category is 0, we want to get books with the latest versionId
          const latestVersion = await db
            .select({ id: appVersion.id })
            .from(appVersion)
            .where(and(
              eq(appVersion.dataType, EnumContentType.BOOK),
              eq(appVersion.status, EnumContentStatus.PUBLISHED)
            ))
            .orderBy(desc(appVersion.id))
            .limit(1);

          if (latestVersion.length > 0) {
            conditions.push(eq(books.versionId, latestVersion[0].id));
          }
        }
        else {
          conditions.push(inArray(bookCategory.id, categoryFilter));

          if (group?.length) {
            conditions.push(inArray(bookGroup.id, group));
          }

          if (grade?.length) {
            conditions.push(inArray(educationGrades.id, grade));
            conditions.push(eq(books.status, EnumContentStatus.PUBLISHED));
          }
        }
      }

      // Build base query with joins
      let baseQuery = db
        .select(buildBaseSelect(true, isLoggedIn, userId))
        .from(books)
        .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
        .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
        .leftJoin(bookEventStats, eq(books.id, bookEventStats.bookId));

      // Add user interaction join if user is logged in
      if (isLoggedIn && userId) {
        baseQuery = baseQuery
          .leftJoin(userBookInteractions, and(
            eq(books.id, userBookInteractions.bookId),
            eq(userBookInteractions.userId, userId)
          ));
      }

      const queryWithWhere = baseQuery.where(and(...conditions));

      // Add sorting
      const order = sortOrder === 'asc' ? 'asc' : 'desc';
      let query;

      switch (sortBy) {
        case 'title':
          query = order === 'asc'
            ? queryWithWhere.orderBy(books.title)
            : queryWithWhere.orderBy(desc(books.title));
          break;
        case 'rating':
          query = order === 'asc'
            ? queryWithWhere.orderBy(bookEventStats.rating)
            : queryWithWhere.orderBy(desc(bookEventStats.rating));
          break;
        case 'viewCount':
          query = order === 'asc'
            ? queryWithWhere.orderBy(bookEventStats.viewCount)
            : queryWithWhere.orderBy(desc(bookEventStats.viewCount));
          break;
        case 'downloadCount':
          query = order === 'asc'
            ? queryWithWhere.orderBy(bookEventStats.downloadCount)
            : queryWithWhere.orderBy(desc(bookEventStats.downloadCount));
          break;
        case 'createdAt':
        default:
          query = order === 'asc'
            ? queryWithWhere.orderBy(books.createdAt)
            : queryWithWhere.orderBy(desc(books.createdAt));
          break;
      }

      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(query.as('subquery'));

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // Apply pagination
      const items = await query
        .limit(limit)
        .offset(offset);

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('book.list.success'),
        data: {
          items: items.map(item => {
            const processedItem = {
              ...item,
              createdAt: item.books?.createdAt ? item.books.createdAt.toISOString() : new Date().toISOString(),
              updatedAt: item.books?.updatedAt ? item.books.updatedAt.toISOString() : new Date().toISOString(),
            };

            // Add user interaction data if user is logged in
            if (isLoggedIn && 'liked' in item) {
              return {
                ...processedItem,
                userInteraction: {
                  liked: (item as any).liked !== undefined ? (item as any).liked : false,
                  disliked: (item as any).disliked !== undefined ? (item as any).disliked : false,
                  rating: (item as any).userRating !== undefined ? parseFloat((item as any).userRating.toString()) : 0,
                  bookmarked: (item as any).bookmarked !== undefined ? (item as any).bookmarked : false,
                }
              };
            }

            return processedItem;
          }),
          total,
          page,
          limit,
          totalPages,
        },
      });
    }),
  });
};

export default publicRoute;