import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  QuestionParams,
} from "../../../../modules/exam/questions/questions.schema.ts";
import { deleteQuestionService } from "../../../../modules/exam/questions/services/delete-question.service.ts";

const deleteQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Questions"],
      params: QuestionParams,
      response: {
        200: ErrorResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof QuestionParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = request.params;

      // Ensure question exists
      const existingQuestion = await db.query.examQuestions.findFirst({
        where: eq(examQuestions.id, id),
      });

      if (!existingQuestion) {
        return reply.notFound(request.t(($) => $.exam.questions.delete.notFound));
      }

      const result = await deleteQuestionService(
        id,
        {
          id: existingQuestion.id,
          passageId: existingQuestion.passageId,
          createdAt: existingQuestion.createdAt,
        },
        request.log,
      );

      if (!result.success) {
        const message = request.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.questions.delete.success),
      });
    },
  });
};

export default deleteQuestionRoute;
