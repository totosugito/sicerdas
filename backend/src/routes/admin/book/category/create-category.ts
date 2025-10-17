import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {withErrorHandler} from "../../../../utils/withErrorHandler.ts";
import {db} from "../../../../db/index.ts";
import {bookCategory, bookStats, type SchemaBookCategoryInsert, EnumBookStats, appVersion} from "../../../../db/schema/index.ts";
import {Type} from "@sinclair/typebox";
import {eq, and} from "drizzle-orm";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/create',
    method: 'POST',
    schema: {
      tags: ['Admin/Book/Category'],
      summary: '',
      description: 'Create Book Category',
      body: Type.Object({
        versionId: Type.Number({
          minimum: 1,
          description: 'The ID of the version this category belongs to'
        }),
        code: Type.String(),
        name: Type.String({
          minLength: 1,
          maxLength: 128,
        }),
        desc: Type.Optional(Type.String()),
        extra: Type.Optional(Type.Object({}, { additionalProperties: true })),
        status: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            id: Type.Number(),
            versionId: Type.Number(),
            code: Type.String(),
            name: Type.String(),
            desc: Type.Optional(Type.String()),
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
        409: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        422: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        }),
        500: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        })
      }
    },
    handler: withErrorHandler(
      async (req, reply) => {
        // Check if category with this ID already exists
        const existingCategory = await db.select()
          .from(bookCategory)
          .where(eq(bookCategory.code, (req.body as SchemaBookCategoryInsert).code))
          .limit(1);

        if (existingCategory.length > 0) {
          return reply.status(409).send({
            success: false,
            message: 'Category with this ID already exists',
          });
        }

        // Check if version exists
        const [version] = await db
          .select()
          .from(appVersion)
          .where(eq(appVersion.id, (req.body as SchemaBookCategoryInsert).versionId))
          .limit(1);

        if (!version) {
          return reply.status(400).send({
            success: false,
            message: 'Version not found'
          });
        }

        // Insert into both tables in a transaction
        const result = await db.transaction(async (tx) => {
          const categoryData = await tx.insert(bookCategory)
            .values(req.body as SchemaBookCategoryInsert)
            .returning();

          // Check if stats entry exists for this category
          const existingStats = await tx.select()
            .from(bookStats)
            .where(
              and(
                eq(bookStats.referenceId, categoryData[0].id),
                eq(bookStats.type, EnumBookStats.category)
              )
            )
            .limit(1);

          if (existingStats.length > 0) {
            // Update existing stats entry to total = 0
            await tx.update(bookStats)
              .set({ total: 0 })
              .where(
                and(
                  eq(bookStats.referenceId, categoryData[0].id),
                  eq(bookStats.type, EnumBookStats.category)
                )
              );
          } else {
            // Insert new stats entry with total = 0
            await tx.insert(bookStats)
              .values({
                referenceId: categoryData[0].id,
                type: EnumBookStats.category,
                total: 0
              });
          }

          return categoryData;
        });

        return reply.status(200).send({
          success: true,
          data: {
            ...result[0],
            createdAt: result[0].createdAt,
            updatedAt: result[0].updatedAt
          }
        });
      },
      422
    ),
  });
}
export default protectedRoute
