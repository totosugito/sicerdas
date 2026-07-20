import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { UploadedFile } from "../../../../types/file.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { updateQuestionSolutionService } from "../../../../modules/exam/question-solutions/services/update-question-solution.service.ts";
import {
  QuestionSolutionParams,
  UpdateQuestionSolutionResponse,
} from "../../../../modules/exam/question-solutions/question-solutions.schema.ts";

const updateQuestionSolutionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Question Solutions"],
      consumes: ["multipart/form-data"],
      params: QuestionSolutionParams,
      response: {
        200: UpdateQuestionSolutionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof QuestionSolutionParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = request.params;

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

      const result = await updateQuestionSolutionService(id, body, files, request.log);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.question_solutions.update.success),
        data: result.data,
      });
    },
  });
};

export default updateQuestionSolutionRoute;
