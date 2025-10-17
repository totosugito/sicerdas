import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {withErrorHandler} from "../../../utils/withErrorHandler.ts";
import {db} from "../../../db/index.ts";
import {
  appVersion,
  books,
  bookGroup,
  educationGrades, EnumDataStatus,
  type SchemaBookInsert
} from "../../../db/schema/index.ts";
import {Type} from "@sinclair/typebox";
import {eq} from "drizzle-orm";
import type {FastifyReply, FastifyRequest} from "fastify";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/create',
    method: 'POST',
    schema: {
      tags: ['Admin/Book'],
      summary: '',
      description: 'Create a new book',
      body: Type.Object({
        bookId: Type.Number({
          description: 'Original BookId from JSON data'
        }),
        versionId: Type.Optional(Type.Number()),
        educationGradeId: Type.Optional(Type.Number()),
        bookGroupId: Type.Optional(Type.Number()),
        title: Type.String({
          minLength: 1,
          maxLength: 255,
          description: 'Title of the book'
        }),
        description: Type.Optional(Type.String({
          description: 'Optional description for the book'
        })),
        author: Type.Optional(Type.String({
          maxLength: 255,
          description: 'Author of the book'
        })),
        publishedYear: Type.String(),
        totalPages: Type.Number({
          minimum: 1,
          description: 'Total number of pages in the book'
        }),
        size: Type.Number({
          minimum: 0,
          description: 'Size of the book in bytes'
        }),
        extra: Type.Optional(Type.Object(
          {},
          {additionalProperties: true, description: 'Additional metadata for the book'}
        )),
        status: Type.Optional(
          Type.String()
        ),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            id: Type.Number(),
            bookId: Type.Number(),
            versionId: Type.Number(),
            title: Type.String(),
            bookGroupId: Type.Number(),
            status: Type.String(),
            createdAt: Type.String({format: 'date-time'})
          })
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        409: Type.Object({
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
      async (req: FastifyRequest, reply: FastifyReply) => {
        const {
          bookId,
          versionId,
          bookGroupId,
          educationGradeId,
          title,
          description = '',
          author = '',
          publishedYear,
          totalPages,
          size,
          extra = {},
          status = EnumDataStatus.published,
        } = req.body as SchemaBookInsert & { bookId: number };

        if(!bookId) {
          return reply.status(400).send({
            success: false,
            message: 'Book ID is required',
          });
        }

        if(!versionId) {
          return reply.status(400).send({
            success: false,
            message: 'Version ID is required',
          });
        }

        if(!bookGroupId) {
          return reply.status(400).send({
            success: false,
            message: 'Book group ID is required',
          });
        }

        if(!educationGradeId) {
          return reply.status(400).send({
            success: false,
            message: 'Education grade ID is required',
          });
        }

        // Check if bookId already exists (should be unique)
        const [existingBook] = await db
          .select()
          .from(books)
          .where(eq(books.bookId, bookId))
          .limit(1);

        if (existingBook) {
          return reply.status(409).send({
            success: false,
            message: 'A book with this bookId already exists',
          });
        }

        if (status && !Object.values(EnumDataStatus).includes(status as keyof typeof EnumDataStatus)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid status value',
          });
        }

        // Check if book group exists
        const [group] = await db
          .select()
          .from(bookGroup)
          .where(eq(bookGroup.id, bookGroupId))
          .limit(1);

        if (!group) {
          return reply.status(404).send({
            success: false,
            message: 'Book group not found'
          });
        }

        // Check if education grade exists
        const [educationGrade] = await db
          .select()
          .from(educationGrades)
          .where(eq(educationGrades.id, educationGradeId))
          .limit(1);

        if (!educationGrade) {
          return reply.status(404).send({
            success: false,
            message: 'Education grade not found'
          });
        }

        // Check if version exists
        const [version] = await db
          .select()
          .from(appVersion)
          .where(eq(appVersion.id, versionId))
          .limit(1);

        if (!version) {
          return reply.status(404).send({
            success: false,
            message: 'Version not found'
          });
        }

        // Create the new book and update stats in a transaction
        const result = await db.transaction(async (tx) => {
          const [newBook] = await tx.insert(books)
            .values({
              bookId,
              versionId,
              bookGroupId,
              educationGradeId,
              title,
              description,
              author,
              publishedYear,
              totalPages,
              size,
              extra,
              status,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning({
              id: books.id,
              bookId: books.bookId,
              versionId: books.versionId,
              title: books.title,
              booksGroupId: books.bookGroupId,
              status: books.status,
              createdAt: books.createdAt
            });

          return newBook;
        });

        return {
          success: true,
          message: 'Book created successfully',
          data: {
            id: result.id,
            bookId: result.bookId,
            versionId: result.versionId,
            title: result.title,
            booksGroupId: result.booksGroupId,
            status: result.status,
            createdAt: result.createdAt
          }
        };
      },
      409
    ),
  });
}
export default protectedRoute;