import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../../../db/db-pool.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  QuestionParams,
  UpdateQuestionResponse,
} from "../../../../modules/exam/questions/questions.schema.ts";
import { updateQuestionService } from "../../../../modules/exam/questions/services/update-question.service.ts";
import type { UploadedFile } from "../../../../types/file.ts";

const updateQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Questions"],
      consumes: ["multipart/form-data"],
      params: QuestionParams,
      response: {
        200: UpdateQuestionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof QuestionParams.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof UpdateQuestionResponse.static> {
      const { id } = request.params;

      // Ensure question exists
      const existingQuestion = await db.query.examQuestions.findFirst({
        where: eq(examQuestions.id, id),
      });

      if (!existingQuestion) {
        return reply.notFound(request.t(($) => $.exam.questions.update.notFound));
      }

      // Parse multipart data
      const parts = request.parts();
      let body: any = {};
      const files: UploadedFile[] = [];

      for await (const part of parts) {
        if (part.type === "file") {
          files.push({
            buffer: await part.toBuffer(),
            filename: part.filename,
            mimetype: part.mimetype,
          });
        } else {
          if (part.fieldname === "data") {
            try {
              body = JSON.parse(part.value as string);
            } catch (e) {
              return reply.badRequest("Invalid JSON data");
            }
          }
        }
      }

      const result = await updateQuestionService(
        id,
        body,
        files,
        existingQuestion.content as any[],
        existingQuestion.reasonContent as any[],
        existingQuestion.createdAt,
        existingQuestion.subjectId,
        existingQuestion.passageId,
        existingQuestion.isActive,
        existingQuestion.scoringStrategy,
        request.log,
      );

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.questions.update.success),
        data: result.data,
      });
    },
  });
};

export default updateQuestionRoute;
