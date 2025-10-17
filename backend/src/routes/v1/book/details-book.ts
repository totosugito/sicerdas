import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { books, bookCategory, bookGroup, educationGrades } from "../../../db/schema/index.ts";
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
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id',
    method: 'GET',
    schema: {
      tags: ['V1/Book'],
      summary: '',
      description: 'Get detailed information about a specific book by ID',
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

      // Query the book with its relations using explicit joins
      const [book] = await db
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
        .where(
          and(
            eq(books.id, id),
            eq(books.status, 'published'),
          )
        )
        .limit(1);

      if (!book) {
        return reply.status(404).send({
          success: false,
          message: 'Book not found',
        });
      }

      // Format dates to ISO strings
      const response = {
        ...book,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      };

      return reply.status(200).send({
        success: true,
        data: response,
      });
    }),
  });
};

export default publicRoute;