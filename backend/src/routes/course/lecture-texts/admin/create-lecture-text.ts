import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  LectureTextDetailResponse,
} from "../../../../modules/course/lecture-texts/lecture-texts.schema.ts";
import { createLectureTextService } from "../../../../modules/course/lecture-texts/services/admin/create-lecture-text.service.ts";
import type { UploadedFile } from "../../../../types/file.ts";

const createRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Course Lecture Texts"],
      summary: "Create a new course lecture text article",
      consumes: ["application/json", "multipart/form-data"],
      response: {
        201: LectureTextDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(req: FastifyRequest, reply: FastifyReply) {
      const userId = req.session.user.id;
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

      const result = await createLectureTextService(body, userId, files);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: req.t(($) => $.course.lectureTexts.create.success),
        data: result.data!,
      });
    },
  });
};

export default createRoute;
