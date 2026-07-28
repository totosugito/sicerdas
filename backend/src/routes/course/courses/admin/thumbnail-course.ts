import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  CourseIdParams,
  ThumbnailQuery,
  ThumbnailResponse,
} from "../../../../modules/course/courses/courses.schema.ts";
import { courseThumbnailService } from "../../../../modules/course/courses/services/admin/thumbnail-course.service.ts";
import type { UploadedFile } from "../../../../types/file.ts";

const thumbnailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/thumbnail/:id",
    method: "PATCH",
    schema: {
      tags: ["Admin Courses"],
      summary: "Upload or remove course thumbnail",
      description:
        "Uploads a thumbnail for an existing course. Supports multipart/form-data. Use ?action=remove to delete.",
      params: CourseIdParams,
      querystring: ThumbnailQuery,
      consumes: ["multipart/form-data"],
      response: {
        200: ThumbnailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof CourseIdParams.static;
        Querystring: typeof ThumbnailQuery.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof ThumbnailResponse.static> {
      const { id } = request.params;
      const { action } = request.query;

      let file: UploadedFile | null = null;

      // Handle UPLOAD action
      if (action !== "remove") {
        const data = await request.file();
        if (!data) {
          const message = request.t(($) => $.exam.packages.thumbnail.noFileUploaded);
          return reply.badRequest(message);
        }

        file = {
          buffer: await data.toBuffer(),
          filename: data.filename,
          mimetype: data.mimetype,
        };
      }

      const result = await courseThumbnailService(id, action, file);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) =>
          action === "remove"
            ? $.exam.packages.thumbnail.removeSuccess
            : $.exam.packages.thumbnail.uploadSuccess,
        ),
        data: result.data!,
      });
    },
  });
};

export default thumbnailRoute;
