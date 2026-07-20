import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { UploadedFile } from "../../../../types/file.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { createQuestionOptionService } from "../../../../modules/exam/question-options/services/create-question-option.service.ts";
import {
  CreateQuestionOptionBody,
  CreateQuestionOptionResponse,
} from "../../../../modules/exam/question-options/question-options.schema.ts";

const createQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Question Options"],
      consumes: ["multipart/form-data"],
      body: CreateQuestionOptionBody,
      response: {
        201: CreateQuestionOptionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(request: FastifyRequest, reply: FastifyReply) {
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

      const result = await createQuestionOptionService(body, files);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.exam.question_options.create.success),
        data: result.data,
      });
    },
  });
};

export default createQuestionOptionRoute;
