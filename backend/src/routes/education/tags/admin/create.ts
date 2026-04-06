import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const CreateTagBody = Type.Object({
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean({ default: true })),
});

const TagResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const CreateTagResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: TagResponseItem,
});

const createTagRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Tags"],
      body: CreateTagBody,
      response: {
        201: CreateTagResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Body: typeof CreateTagBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { name, description, isActive } = request.body;

      // Check if name already exists
      const existingTag = await db.query.educationTags.findFirst({
        where: eq(educationTags.name, name),
      });

      if (existingTag) {
        return reply.badRequest(t(($) => $.education.tags.create.exists));
      }

      const userId = request.session.user.id;

      const [newTag] = await db
        .insert(educationTags)
        .values({
          name,
          description,
          isActive: isActive ?? true,
          createdByUserId: userId,
        })
        .returning();

      return reply.status(201).send({
        success: true,
        message: t(($) => $.education.tags.create.success),
        data: {
          ...newTag,
          createdAt: newTag.createdAt.toISOString(),
          updatedAt: newTag.updatedAt.toISOString(),
        },
      });
    }),
  });
};

export default createTagRoute;
