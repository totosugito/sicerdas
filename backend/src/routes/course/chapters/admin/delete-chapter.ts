import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";
import { ChapterIdParams } from "../../../../modules/course/chapters/chapters.schema.ts";
import { deleteChapterService } from "../../../../modules/course/chapters/services/admin/delete-chapter.service.ts";

const deleteRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Course Chapters"],
      summary: "Delete a chapter",
      params: ChapterIdParams,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof ChapterIdParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = req.params;
      const result = await deleteChapterService(id);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.chapters.delete.success),
      });
    },
  });
};

export default deleteRoute;
