import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {db} from "../../../../db/index.ts";
import {withErrorHandler} from "../../../../utils/withErrorHandler.ts";
import {appVersion, bookCategory, type SchemaBookCategoryInsert} from "../../../../db/schema/index.ts";
import {eq, sql} from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id',
    method: 'PUT',
    schema: {
      tags: ['Admin/Book/Category'],
      summary: '',
      description: 'Book Category Update',
      params: Type.Object({
        id: Type.Number()
      }),
      body: Type.Object({
        versionId: Type.Optional(Type.Number()),
        name: Type.String({
          minLength: 1,
          maxLength: 128,
        }),
        desc: Type.Optional(Type.String()),
        extra: Type.Optional(Type.Object({}, { additionalProperties: true })),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Array(Type.Object({
            id: Type.Number(),
            versionId: Type.Number(),
            code: Type.String(),
            name: Type.String(),
            desc: Type.Optional(Type.String()),
            extra: Type.Optional(Type.Object({}, { additionalProperties: true })),
            status: Type.String(),
            createdAt: Type.String({ format: 'date-time' }),
            updatedAt: Type.String({ format: 'date-time' })
          }))
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        404: Type.Object({
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
      async (req, reply) => {
        const { id } = req.params as { id: number };
        const { id: _id, code: _code, status: _status, createdAt: _createdAt, ...updateFields } = req.body as SchemaBookCategoryInsert;

        // Check if category exists
        const [existingCategory] = await db.select()
          .from(bookCategory)
          .where(eq(bookCategory.id, id))
          .limit(1);

        if (!existingCategory) {
          return reply.status(404).send({
            success: false,
            message: 'Category not found'
          });
        }

        // Check if version exists
        if(updateFields.versionId) {
          const [version] = await db
            .select()
            .from(appVersion)
            .where(eq(appVersion.id, updateFields.versionId))
            .limit(1);

          if (!version) {
            return reply.status(404).send({
              success: false,
              message: 'Version not found'
            });
          }
        }

        // Check for duplicate name only if the name is being changed
        if (updateFields.name && updateFields.name !== existingCategory.name) {
          const [duplicate] = await db.select()
            .from(bookCategory)
            .where(
              sql`${bookCategory.name} = ${updateFields.name} AND ${bookCategory.id} != ${id}`
            )
            .limit(1);

          if (duplicate) {
            return reply.status(409).send({
              success: false,
              message: 'A category with this name already exists'
            });
          }
        }

        const data = await db.update(bookCategory)
          .set({
            ...updateFields,
            updatedAt: sql`NOW()`
          })
          .where(eq(bookCategory.id, id))
          .returning();

        return reply.status(200).send({
          success: true,
          data: data.map(item => ({
            ...item,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }))
        });
      },
      422
    ),
  });
}
export default protectedRoute
