import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  CourseIdParams,
  LikeResponse,
  toggleLikeService,
} from "../../../../modules/course/interactions/index.ts";

const likeRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/like/:courseId",
    method: "POST",
    schema: {
      tags: ["User Course Interactions"],
      params: CourseIdParams,
      response: {
        200: LikeResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof CourseIdParams.static }>,
      reply: FastifyReply,
    ) {
      const userId = request.session.user.id;
      const result = await toggleLikeService(request.params.courseId, userId);

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

export default likeRoute;
