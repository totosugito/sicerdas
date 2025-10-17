import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {withErrorHandler} from "../../../utils/withErrorHandler.ts";
import {db} from "../../../db/index.ts";
import {
  appVersion,
  books,
  bookGroup,
  educationGrades,
  type SchemaBookInsert
} from "../../../db/schema/index.ts";
import {Type} from "@sinclair/typebox";
import {eq} from "drizzle-orm";
import type {FastifyReply, FastifyRequest} from "fastify";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id',
    method: 'PUT',
    schema: {
      tags: ['Admin/Book'],
      summary: 'Update a book',
      description: 'Update an existing book',
      params: Type.Object({
        id: Type.String({ format: 'uuid' })
      }),
      body: Type.Object({
        booksGroupId: Type.Optional(Type.Number({
          description: 'The ID of the book group this book belongs to'
        })),
        educationGradeId: Type.Optional(Type.Number({
          description: 'The ID of the education grade this book is for'
        })),
        versionId: Type.Optional(Type.Number({
          description: 'The ID of the version this book belongs to'
        })),
        title: Type.Optional(Type.String({
          minLength: 1,
          maxLength: 255,
          description: 'Title of the book'
        })),
        description: Type.Optional(Type.String({
          description: 'Optional description for the book'
        })),
        author: Type.Optional(Type.String({
          maxLength: 255,
          description: 'Author of the book'
        })),
        publishedYear: Type.Optional(Type.String()),
        totalPages: Type.Optional(Type.Number({
          minimum: 1,
          description: 'Total number of pages in the book'
        })),
        size: Type.Optional(Type.Number({
          minimum: 0,
          description: 'Size of the book in bytes'
        })),
        extra: Type.Optional(Type.Object(
          {},
          { additionalProperties: true, description: 'Additional metadata for the book' }
        )),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            id: Type.Number(),
            booksGroupId: Type.Number(),
            educationGradeId: Type.Number(),
            versionId: Type.Number(),
            title: Type.String(),
            description: Type.Optional(Type.String()),
            author: Type.Optional(Type.String()),
            publishedYear: Type.Optional(Type.String()),
            totalPages: Type.Optional(Type.Number()),
            size: Type.Optional(Type.Number()),
            extra: Type.Optional(Type.Object({}, { additionalProperties: true })),
            status: Type.String(),
            createdAt: Type.String({ format: 'date-time' }),
            updatedAt: Type.String({ format: 'date-time' })
          })
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        404: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        500: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        })
      }
    },
    handler: withErrorHandler(
      async (req: FastifyRequest<{ Params: { id: string }, Body: Partial<SchemaBookInsert> }>, reply: FastifyReply) => {
        const { id } = req.params;
        const updateData = req.body;

        // Check if book exists
        const [existingBook] = await db
          .select()
          .from(books)
          .where(eq(books.id, id))
          .limit(1);

        if (!existingBook) {
          return reply.status(404).send({
            success: false,
            message: 'Book not found'
          });
        }

        // If booksGroupId is being updated, verify it exists
        if (updateData.bookGroupId && updateData.bookGroupId !== existingBook.bookGroupId) {
          const [group] = await db
            .select()
            .from(bookGroup)
            .where(eq(bookGroup.id, updateData.bookGroupId))
            .limit(1);

          if (!group) {
            return reply.status(404).send({
              success: false,
              message: 'Book group not found'
            });
          }
        }

        // If educationGradeId is being updated, verify it exists
        if (updateData.educationGradeId && updateData.educationGradeId !== existingBook.educationGradeId) {
          const [grade] = await db
            .select()
            .from(educationGrades)
            .where(eq(educationGrades.id, updateData.educationGradeId))
            .limit(1);

          if (!grade) {
            return reply.status(404).send({
              success: false,
              message: 'Education grade not found'
            });
          }
        }

        // If versionId is being updated, verify it exists
        if (updateData.versionId && updateData.versionId !== existingBook.versionId) {
          const [version] = await db
            .select()
            .from(appVersion)
            .where(eq(appVersion.id, updateData.versionId))
            .limit(1);

          if (!version) {
            return reply.status(404).send({
              success: false,
              message: 'Version not found'
            });
          }
        }

        // Exclude id and createdAt from update data
        const { id: _, createdAt: __, status: ___, ...updateFields } = updateData;

        // Update the book
        const [updatedBook] = await db
          .update(books)
          .set({
            ...updateFields,
            updatedAt: new Date()
          })
          .where(eq(books.id, id))
          .returning();

        return reply.send({
          success: true,
          data: {
            id: updatedBook.id,
            booksGroupId: updatedBook.bookGroupId,
            educationGradeId: updatedBook.educationGradeId,
            versionId: updatedBook.versionId,
            title: updatedBook.title,
            description: updatedBook.description,
            author: updatedBook.author,
            publishedYear: updatedBook.publishedYear,
            totalPages: updatedBook.totalPages,
            size: updatedBook.size,
            extra: updatedBook.extra,
            status: updatedBook.status,
            createdAt: updatedBook.createdAt,
            updatedAt: updatedBook.updatedAt
          }
        });
      }
    )
  });
};
export default protectedRoute;
