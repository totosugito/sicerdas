import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  CourseIdParams,
  BookmarkResponse,
  toggleBookmarkService,
} from "../../../../modules/course/interactions/index.ts";

const bookmarkRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/bookmark/:courseId",
    method: "POST",
    schema: {
      tags: ["User Course Interactions"],
      params: CourseIdParams,
      response: {
        200: BookmarkResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof CourseIdParams.static }>,
      reply: FastifyReply,
    ) {
      const userId = request.session.user.id;
      const result = await toggleBookmarkService(request.params.courseId, userId);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 403) {
          return reply.forbidden(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.courses.detail.success),
        data: result.data!,
      });
    },
  });
};

export default bookmarkRoute;
