import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {withErrorHandler} from "../../../../utils/withErrorHandler.ts";
import {db} from "../../../../db/index.ts";
import {
  bookGroup,
  bookCategory,
  type SchemaBookGroupInsert,
  bookStats,
  EnumBookStats, appVersion
} from "../../../../db/schema/index.ts";
import {Type} from "@sinclair/typebox";
import {eq, and} from "drizzle-orm";
import type {FastifyReply, FastifyRequest} from "fastify";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/create',
    method: 'POST',
    schema: {
      tags: ['Admin/Book/Group'],
      summary: '',
      description: 'Create a new book group within a category',
      body: Type.Object({
        versionId: Type.Optional(Type.Number()),
        categoryId: Type.Optional(Type.Number()),
        name: Type.String({
          minLength: 1,
          maxLength: 128,
          description: 'Name of the book group'
        }),
        desc: Type.Optional(Type.String({
          description: 'Optional description for the book group'
        })),
        extra: Type.Optional(Type.Object(
          {},
          {additionalProperties: true, description: 'Additional metadata for the book group'}
        )),
        status: Type.Optional(
          Type.String()
        ),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          data: Type.Object({
            id: Type.String({ format: 'uuid' }),
            versionId: Type.Number(),
            name: Type.String(),
            categoryId: Type.Number()
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
      async (req: FastifyRequest, reply: FastifyReply) => {
        const {versionId, categoryId, name, desc = '', extra = {}, status = 'published'} = req.body as SchemaBookGroupInsert & {
          categoryId: number
        };

        if(!versionId) {
          return reply.status(400).send({
            success: false,
            message: 'Missing version ID'
          });
        }

        if(!categoryId) {
          return reply.status(400).send({
            success: false,
            message: 'Missing category ID'
          });
        }

        // Check if category exists
        const [category] = await db
          .select()
          .from(bookCategory)
          .where(eq(bookCategory.id, categoryId))
          .limit(1);

        if (!category) {
          return reply.status(404).send({
            success: false,
            message: 'Category not found'
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

        // Check if group with this name already exists in the same category
        const [existingGroup] = await db
          .select()
          .from(bookGroup)
          .where(
            and(
              eq(bookGroup.name, name),
              eq(bookGroup.categoryId, categoryId)
            )
          )
          .limit(1);

        if (existingGroup) {
          return reply.status(400).send({
            success: false,
            message: 'A group with this name already exists in this category'
          });
        }

        // Create the new group and update stats in a transaction
        const result = await db.transaction(async (tx) => {
          // Insert the new group
          const [newGroup] = await tx.insert(bookGroup)
            .values({
              versionId,
              categoryId,
              name,
              desc,
              extra,
              status,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning({
              id: bookGroup.id,
              versionId: bookGroup.versionId,
              name: bookGroup.name,
              categoryId: bookGroup.categoryId,
              status: bookGroup.status,
              createdAt: bookGroup.createdAt
            });

          // Check if stats entry exists for this group
          const existingStats = await tx.select()
            .from(bookStats)
            .where(
              and(
                eq(bookStats.referenceId, newGroup.id),
                eq(bookStats.type, EnumBookStats.group)
              )
            )
            .limit(1);

          if (existingStats.length > 0) {
            // Update existing stats entry to total = 0
            await tx.update(bookStats)
              .set({
                total: 0,
                updatedAt: new Date()
              })
              .where(
                and(
                  eq(bookStats.referenceId, newGroup.id),
                  eq(bookStats.type, EnumBookStats.group)
                )
              );
          } else {
            // Insert new stats entry with total = 0
            await tx.insert(bookStats)
              .values({
                referenceId: newGroup.id,
                type: EnumBookStats.group,
                total: 0
              });
          }

          return newGroup;
        });

        return {
          success: true,
          message: 'Book group created successfully',
          data: {
            id: result.id,
            versionId: result.versionId,
            name: result.name,
            categoryId: result.categoryId
          }
        };
      },
      409
    ),
  });
}
export default protectedRoute
