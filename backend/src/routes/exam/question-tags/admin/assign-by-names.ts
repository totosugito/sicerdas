import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { educationTags } from "../../../../db/schema/education/tags.ts";
import { examQuestionTags } from "../../../../db/schema/exam/question-tags.ts";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { eq, sql } from "drizzle-orm";

const AssignQuestionTagsByNameBody = Type.Object({
  questionId: Type.String({ format: "uuid" }),
  tags: Type.Array(Type.String(), { minItems: 1 }),
});

const AssignQuestionTagsByNameResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const assignQuestionTagsByNameRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/assign-by-names",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Tags"],
      body: AssignQuestionTagsByNameBody,
      response: {
        200: AssignQuestionTagsByNameResponse,
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
      request: FastifyRequest<{ Body: typeof AssignQuestionTagsByNameBody.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const { questionId, tags } = request.body;

      const tagIds: string[] = [];

      for (const tagName of tags) {
        const trimmedName = tagName.trim();
        if (!trimmedName) continue;

        // Try to find existing tag
        const existingTag = await db.query.educationTags.findFirst({
          where: eq(sql`lower(${educationTags.name})`, trimmedName.toLowerCase()),
        });

        let tagId: string;
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          // Create new tag
          const [newTag] = await db
            .insert(educationTags)
            .values({
              name: trimmedName,
            })
            .returning({ id: educationTags.id });
          tagId = newTag.id;
        }
        tagIds.push(tagId);
      }

      if (tagIds.length > 0) {
        // Use ON CONFLICT DO NOTHING to avoid duplicate key errors in assignments
        const values = tagIds.map((tagId) => ({
          questionId,
          tagId,
        }));

        await db.insert(examQuestionTags).values(values).onConflictDoNothing();
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.question_tags.assign.success),
      });
    }),
  });
};

export default assignQuestionTagsByNameRoute;
