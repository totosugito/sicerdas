import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AdminCreateChapterBody,
  ChapterDetailResponse,
} from "../../../../modules/course/chapters/chapters.schema.ts";
import { createChapterService } from "../../../../modules/course/chapters/services/admin/create-chapter.service.ts";

const createRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Course Chapters"],
      summary: "Create a new chapter",
      body: AdminCreateChapterBody,
      response: {
        201: ChapterDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof AdminCreateChapterBody.static }>,
      reply: FastifyReply,
    ) {
      const userId = req.session.user.id;
      const result = await createChapterService(req.body, userId);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: req.t(($) => $.course.chapters.create.success),
        data: result.data!,
      });
    },
  });
};

export default createRoute;
