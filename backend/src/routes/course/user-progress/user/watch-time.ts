import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  UserLectureIdParams,
  UpdateWatchTimeBody,
  WatchTimeResponse,
  updateWatchTimeService,
} from "../../../../modules/course/user-progress/index.ts";

const watchTimeRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/lecture/:lectureId/watch-time",
    method: "PUT",
    schema: {
      tags: ["User Course Progress"],
      params: UserLectureIdParams,
      body: UpdateWatchTimeBody,
      response: {
        200: WatchTimeResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof UserLectureIdParams.static;
        Body: typeof UpdateWatchTimeBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const userId = request.session.user.id;
      const { watchTimeSeconds } = request.body;

      const result = await updateWatchTimeService(
        request.params.lectureId,
        userId,
        watchTimeSeconds
      );

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.lectures.detail.success),
        data: result.data!,
      });
    },
  });
};

export default watchTimeRoute;
