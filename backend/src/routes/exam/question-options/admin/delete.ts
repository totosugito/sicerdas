import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestionOptions } from "../../../../db/schema/exam/question-options.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { cleanupBlockNoteFiles } from "../../../../utils/blocknote/blocknote-utils.ts";
import { syncQuestionMaxScore } from "../../../../services/exam/index.ts";

const DeleteQuestionOptionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const DeleteQuestionOptionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const deleteQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Question Options"],
      params: DeleteQuestionOptionParams,
      response: {
        200: DeleteQuestionOptionResponse,
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
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof DeleteQuestionOptionParams.static }>,
      reply: FastifyReply,
    ) {
            const { id } = request.params;

      // Ensure option exists
      const existingOption = await db.query.examQuestionOptions.findFirst({
        where: eq(examQuestionOptions.id, id),
      });

      if (!existingOption) {
        return reply.notFound(request.t(($) => $.exam.question_options.delete.notFound));
      }

      // Perform Hard Delete
      await db.delete(examQuestionOptions).where(eq(examQuestionOptions.id, id));

      // Clean up files from disk
      await cleanupBlockNoteFiles(
        existingOption.content as any[],
        [],
        env.server.uploadsQuestionDir,
        ["image"],
        request.log,
      );

      // Sync Question Max Score
      await syncQuestionMaxScore(existingOption.questionId);

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_options.delete.success),
      });
    },
  });
};

export default deleteQuestionOptionRoute;
