import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { UploadedFile } from "../../../../types/file.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { updatePassageService } from "../../../../modules/exam/passages/services/update-passage.service.ts";
import {
  PassageParams,
  UpdatePassageBody,
  PassageDetailResponse,
} from "../../../../modules/exam/passages/passages.schema.ts";

const updatePassageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Passages"],
      consumes: ["multipart/form-data"],
      params: PassageParams,
      body: UpdatePassageBody,
      response: {
        200: PassageDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof PassageParams.static }>,
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

      const result = await updatePassageService(id, body, files, request.log);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.passages.update.success),
        data: result.data,
      });
    },
  });
};

export default updatePassageRoute;
