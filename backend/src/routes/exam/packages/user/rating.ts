import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  UpdateRatingBody,
  RatingResponse,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { ratingService } from "../../../../modules/exam/packages/services/user/rating.service.ts";

const ratingRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/rating",
    method: "POST",
    schema: {
      tags: ["Exam Packages User"],
      summary: "Update exam package rating",
      description: "Set a rating for a specific exam package",
      body: UpdateRatingBody,
      response: {
        200: RatingResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof UpdateRatingBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof RatingResponse.static> {
      const userId = (req as any).session.user.id;

      const result = await ratingService(req.body, userId);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.packages.rating.updated),
        data: result.data!,
      });
    },
  });
};

export default ratingRoute;
