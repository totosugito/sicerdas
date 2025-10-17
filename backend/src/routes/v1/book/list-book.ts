import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {Type} from '@sinclair/typebox';
import {withErrorHandler} from "../../../utils/withErrorHandler.ts";
import {db} from "../../../db/index.ts";
import {books, bookCategory, bookGroup, educationGrades} from "../../../db/schema/index.ts";
import {and, eq, inArray, sql, or, ilike} from "drizzle-orm";
import type {FastifyReply, FastifyRequest} from "fastify";

const BookListQuery = Type.Object({
  category: Type.Optional(Type.Array(Type.Number())),
  group: Type.Optional(Type.Array(Type.Number())),
  grade: Type.Optional(Type.Array(Type.Number())),
  search: Type.Optional(Type.String({description: 'Search term for book title or author'})),
  page: Type.Optional(Type.Number({default: 1, minimum: 1})),
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
  createdAt: Type.String({format: 'date-time'}),
  updatedAt: Type.String({format: 'date-time'}),
});

const BookListResponse = Type.Object({
  success: Type.Boolean(),
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
      summary: '',
      description: 'Get a paginated list of books with filtering options',
      body: BookListQuery,
      response: {
        200: BookListResponse,
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Body: typeof BookListQuery.static }>,
      reply: FastifyReply
    ): Promise<typeof BookListResponse.static> {
      const {category, group, grade, search, page = 1, limit = 10} = req.body;
      const offset = (page - 1) * limit;

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
        conditions.push(inArray(bookCategory.id, category));
      }

      if (group?.length) {
        conditions.push(inArray(bookGroup.id, group));
      }

      if (grade?.length) {
        conditions.push(inArray(educationGrades.id, grade));
      }

      // Build the query with all conditions combined with AND
      const query = db
        .select({
          id: books.id,
          title: books.title,
          description: books.description,
          author: books.author,
          publishedYear: books.publishedYear,
          totalPages: books.totalPages,
          size: books.size,
          status: books.status,
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
        })
        .from(books)
        .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
        .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
        .where(and(...conditions));

      // Get total count for pagination
      const countResult = await db
        .select({count: sql<number>`count(*)`})
        .from(query.as('subquery'));

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // Apply pagination
      const items = await query
        .limit(limit)
        .offset(offset);

      return reply.status(200).send({
        success: true,
        data: {
          items: items.map(item => ({
            ...item,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
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