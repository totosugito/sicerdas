import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
import { eq } from "drizzle-orm";
import env from "../../../../config/env.config.ts";
import { cleanupBlockNoteFiles } from "../../../../utils/blocknote/blocknote-utils.ts";

const DeleteQuestionSolutionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const DeleteQuestionSolutionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const deleteQuestionSolutionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Question Solutions"],
      params: DeleteQuestionSolutionParams,
      response: {
        200: DeleteQuestionSolutionResponse,
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
      request: FastifyRequest<{ Params: typeof DeleteQuestionSolutionParams.static }>,
      reply: FastifyReply,
    ) {
            const { id } = request.params;

      // Ensure solution exists
      const existingSolution = await db.query.examQuestionSolutions.findFirst({
        where: eq(examQuestionSolutions.id, id),
      });

      if (!existingSolution) {
        return reply.notFound(request.t(($) => $.exam.question_solutions.delete.notFound));
      }

      // Perform Hard Delete
      await db.delete(examQuestionSolutions).where(eq(examQuestionSolutions.id, id));

      // Clean up files from disk
      await cleanupBlockNoteFiles(
        existingSolution.content as any[],
        [],
        env.server.uploadsQuestionDir,
        ["image"],
        request.log,
      );

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_solutions.delete.success),
      });
    },
  });
};

export default deleteQuestionSolutionRoute;
