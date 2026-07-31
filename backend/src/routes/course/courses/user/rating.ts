import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  CourseIdParams,
  RatingBody,
  RatingResponse,
  rateCourseService,
} from "../../../../modules/course/interactions/index.ts";

const ratingRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/rating/:courseId",
    method: "POST",
    schema: {
      tags: ["User Course Interactions"],
      params: CourseIdParams,
      body: RatingBody,
      response: {
        200: RatingResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof CourseIdParams.static;
        Body: typeof RatingBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const userId = request.session.user.id;
      const { rating } = request.body;

      const result = await rateCourseService(request.params.courseId, userId, rating);

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

export default ratingRoute;
