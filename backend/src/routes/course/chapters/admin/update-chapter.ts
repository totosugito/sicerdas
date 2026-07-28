import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  ChapterIdParams,
  AdminUpdateChapterBody,
  ChapterDetailResponse,
} from "../../../../modules/course/chapters/chapters.schema.ts";
import { updateChapterService } from "../../../../modules/course/chapters/services/admin/update-chapter.service.ts";

const updateRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Course Chapters"],
      summary: "Update chapter details",
      params: ChapterIdParams,
      body: AdminUpdateChapterBody,
      response: {
        200: ChapterDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{
        Params: typeof ChapterIdParams.static;
        Body: typeof AdminUpdateChapterBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const { id } = req.params;
      const result = await updateChapterService(id, req.body);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.chapters.update.success),
        data: result.data!,
      });
    },
  });
};

export default updateRoute;
