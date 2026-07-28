import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  LectureTextIdParams,
  LectureTextDetailResponse,
} from "../../../../modules/course/lecture-texts/lecture-texts.schema.ts";
import { updateLectureTextService } from "../../../../modules/course/lecture-texts/services/admin/update-lecture-text.service.ts";
import type { UploadedFile } from "../../../../types/file.ts";

const updateRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Course Lecture Texts"],
      summary: "Update course lecture text article",
      params: LectureTextIdParams,
      consumes: ["application/json", "multipart/form-data"],
      response: {
        200: LectureTextDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof LectureTextIdParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = req.params;
      let body: any = req.body;
      const files: UploadedFile[] = [];

      if (req.isMultipart()) {
        const parts = req.parts();
        body = {};
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
              } catch {
                return reply.badRequest("Invalid JSON data");
              }
            } else {
              body[part.fieldname] = part.value;
            }
          }
        }
      }

      const result = await updateLectureTextService(id, body, files, req.log);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.lectureTexts.update.success),
        data: result.data!,
      });
    },
  });
};

export default updateRoute;
