import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  CreateQuestionResponse,
} from "../../../../modules/exam/questions/questions.schema.ts";
import { createQuestionService } from "../../../../modules/exam/questions/services/create-question.service.ts";
import type { UploadedFile } from "../../../../types/file.ts";

const createQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Questions"],
      consumes: ["multipart/form-data"],
      response: {
        201: CreateQuestionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.session.user.id;

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

      const result = await createQuestionService(userId, body, files);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.exam.questions.create.success),
        data: result.data,
      });
    },
  });
};

export default createQuestionRoute;
