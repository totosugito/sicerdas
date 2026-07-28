import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  ChapterIdParams,
  ChapterDetailResponse,
} from "../../../../modules/course/chapters/chapters.schema.ts";
import { detailChapterService } from "../../../../modules/course/chapters/services/admin/detail-chapter.service.ts";

const detailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Admin Course Chapters"],
      summary: "Get chapter details",
      params: ChapterIdParams,
      response: {
        200: ChapterDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof ChapterIdParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = req.params;
      const result = await detailChapterService(id);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.chapters.detail.success),
        data: result.data!,
      });
    },
  });
};

export default detailRoute;
