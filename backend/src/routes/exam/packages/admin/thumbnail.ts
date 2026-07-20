import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  PackageIdParams,
  ThumbnailQuery,
  ThumbnailResponse,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { thumbnailService } from "../../../../modules/exam/packages/services/admin/thumbnail.service.ts";
import type { UploadedFile } from "../../../../types/file.ts";

const thumbnailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/thumbnail/:id",
    method: "PATCH",
    schema: {
      tags: ["Admin Exam Packages"],
      summary: "Upload or remove package thumbnail",
      description:
        "Uploads a thumbnail for an existing exam package. Supports multipart/form-data. Use ?action=remove to delete.",
      params: PackageIdParams,
      querystring: ThumbnailQuery,
      consumes: ["multipart/form-data"],
      response: {
        200: ThumbnailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof PackageIdParams.static;
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

      const result = await thumbnailService(id, action, file);

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
