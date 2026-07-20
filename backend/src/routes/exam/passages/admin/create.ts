import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { UploadedFile } from "../../../../types/file.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { createPassageService } from "../../../../modules/exam/passages/services/create-passage.service.ts";
import {
  CreatePassageBody,
  PassageDetailResponse,
} from "../../../../modules/exam/passages/passages.schema.ts";

const createPassageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Passages"],
      consumes: ["multipart/form-data"],
      body: CreatePassageBody,
      response: {
        201: PassageDetailResponse,
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

      const result = await createPassageService(userId, body, files);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.exam.passages.create.success),
        data: result.data,
      });
    },
  });
};

export default createPassageRoute;
