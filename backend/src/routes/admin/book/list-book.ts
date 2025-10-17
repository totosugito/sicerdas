import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { and, asc, desc, eq, like, or, sql, type SQL, type SQLWrapper } from "drizzle-orm";
import { db } from "../../../db/index.ts";
import {books, bookGroup, educationGrades, EnumDataStatus} from "../../../db/schema/index.ts";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

export const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/list',
    method: 'GET',
    schema: {
      tags: ['Admin/Book'],
      summary: '',
      description: 'Get list of books with pagination and sorting',
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
        sort: Type.Optional(Type.String({
          enum: ['groupName', 'educationGradeName', 'title', 'author', 'publishedYear', 'size'],
          default: 'title'
        })),
        order: Type.Optional(Type.String({
          enum: ['asc', 'desc'],
          default: 'asc'
        })),
        search: Type.Optional(Type.String()),
        groupId: Type.Optional(Type.Number()),
        educationGradeId: Type.Optional(Type.Number()),
        status: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Array(Type.Object({
            id: Type.String({ format: 'uuid' }),
            bookId: Type.String(),
            versionId: Type.Number(),
            title: Type.String(),
            author: Type.String(),
            publishedYear: Type.String(),
            size: Type.Number(),

            status: Type.String(),
            groupId: Type.Number(),
            groupName: Type.String(),
            educationGradeId: Type.Number(),
            educationGradeName: Type.String(),
            createdAt: Type.String({ format: 'date-time' }),
            updatedAt: Type.String({ format: 'date-time' })
          })),
          pagination: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number()
          })
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        500: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        })
      }
    },
    handler: withErrorHandler(async (req, reply) => {
      const {
        page = 1,
        limit = 10,
        sort = 'title',
        order = 'asc',
        search,
        groupId,
        educationGradeId,
        status,
      } = req.query as {
        page?: number;
        limit?: number;
        sort?: 'groupName' | 'educationGradeName' | 'title' | 'author' | 'publishedYear' | 'size';
        order?: 'asc' | 'desc';
        search?: string;
        groupId?: number;
        educationGradeId?: number;
        status?: string;
      };

      if (status && !Object.values(EnumDataStatus).includes(status as keyof typeof EnumDataStatus)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid status value',
        });
      }

      // Create sort expression
      const orderBy = order === 'asc' ? asc : desc;
      let sortColumn: SQL.Aliased | SQLWrapper;

      // Handle sorting for different fields including joined tables
      switch (sort) {
        case 'groupName':
          sortColumn = bookGroup.name;
          break;
        case 'educationGradeName':
          sortColumn = educationGrades.name;
          break;
        case 'author':
          sortColumn = books.author;
          break;
        case 'publishedYear':
          sortColumn = books.publishedYear;
          break;
        case 'size':
          sortColumn = books.size;
          break;
        default:
          sortColumn = books.title;
      }

      // Build where conditions
      const conditions = [];

      // Search condition
      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
          or(
            like(books.title, searchTerm),
            like(books.author, searchTerm),
            like(books.publishedYear, searchTerm)
          )
        );
      }

      // Filter by group
      if (groupId) {
        conditions.push(eq(books.bookGroupId, groupId));
      }

      // Filter by education grade
      if (educationGradeId) {
        conditions.push(eq(books.educationGradeId, educationGradeId));
      }

      if (status) {
        conditions.push(eq(books.status, status));
      }

      const offset = (page - 1) * limit;

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(books)
        .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
        .$dynamic();

      if (conditions.length > 0) {
        countQuery.where(and(...conditions));
      }

      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      // Base query with joins and pagination
      const bookList = await db
        .select({
          id: books.id,
          bookId: books.bookId,
          versionId: books.versionId,
          title: books.title,
          author: books.author,
          publishedYear: books.publishedYear,
          size: books.size,

          status: books.status,
          groupId: books.bookGroupId,
          groupName: bookGroup.name,
          educationGradeId: books.educationGradeId,
          educationGradeName: educationGrades.name,
          createdAt: books.createdAt,
          updatedAt: books.updatedAt,
        })
        .from(books)
        .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
        .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
        .$dynamic()
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderBy(sortColumn as SQL))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data: bookList.map(book => ({
          ...book,
          groupName: book.groupName || '',
          educationGradeName: book.educationGradeName || '',
          createdAt: book.createdAt ? book.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: book.updatedAt ? book.updatedAt.toISOString() : new Date().toISOString()
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };

      // The response is already being returned from the bookList query above
    })
  });
};

export default protectedRoute;
