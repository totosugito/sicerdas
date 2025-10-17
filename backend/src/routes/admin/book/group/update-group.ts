import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {db} from "../../../../db/index.ts";
import {withErrorHandler} from "../../../../utils/withErrorHandler.ts";
import {bookGroup, bookCategory, type SchemaBookGroupInsert, appVersion} from "../../../../db/schema/index.ts";
import {eq, and, sql} from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id',
    method: 'PUT',
    schema: {
      tags: ['Admin/Book/Group'],
      summary: '',
      description: 'Update a book group by ID',
      params: Type.Object({
        id: Type.Number()
      }),
      body: Type.Object({
        versionId: Type.Optional(Type.Number()),
        name: Type.String({
          minLength: 1,
          maxLength: 128,
        }),
        categoryId: Type.Number({
          minimum: 1,
          description: 'The ID of the category this group belongs to'
        }),
        desc: Type.Optional(Type.String()),
        extra: Type.Optional(Type.Object({}, { additionalProperties: true })),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            id: Type.Number(),
            versionId: Type.Number(),
            name: Type.String(),
            categoryId: Type.Number(),
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
        const { id: _id, status: _status, createdAt: _createdAt, ...updateFields } = req.body as SchemaBookGroupInsert;

        // Check if group exists
        const [existingGroup] = await db.select()
          .from(bookGroup)
          .where(eq(bookGroup.id, id))
          .limit(1);

        if (!existingGroup) {
          return reply.status(404).send({
            success: false,
            message: 'Group not found'
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

        // Check for duplicate name within the same category (excluding the current group)
        if (updateFields.name && (updateFields.categoryId || existingGroup.categoryId)) {
          const categoryIdToCheck = updateFields.categoryId || existingGroup.categoryId;
          const [duplicate] = await db.select()
            .from(bookGroup)
            .where(
              and(
                eq(bookGroup.name, updateFields.name),
                eq(bookGroup.categoryId, categoryIdToCheck),
                sql`${bookGroup.id} != ${id}` // Exclude the current group from the check
              )
            )
            .limit(1);

          if (duplicate) {
            return reply.status(409).send({
              success: false,
              message: 'Another group with this name already exists in this category'
            });
          }
        }

        // Check if category exists using the provided categoryId
        if (updateFields.categoryId) {
          const [category] = await db.select()
            .from(bookCategory)
            .where(eq(bookCategory.id, updateFields.categoryId))
            .limit(1);

          if (!category) {
            return reply.status(400).send({
              success: false,
              message: 'Category not found'
            });
          }
        }

        // Update the group by ID
        const [updatedGroup] = await db.update(bookGroup)
          .set({
            ...updateFields,
            updatedAt: sql`NOW()`
          })
          .where(eq(bookGroup.id, id))
          .returning();

        if (!updatedGroup) {
          return reply.status(404).send({
            success: false,
            message: 'Group not found or not updated'
          });
        }

        return reply.status(200).send({
          success: true,
          data: {
            ...updatedGroup,
            createdAt: updatedGroup.createdAt,
            updatedAt: updatedGroup.updatedAt
          }
        });
      },
      422
    ),
  });
};
export default protectedRoute;

