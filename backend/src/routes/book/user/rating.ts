import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ratingService } from "../../../modules/book/services/user/rating.service.ts";
import { RatingBody, RatingResponse } from "../../../modules/book/book.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const userRatingRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/rating",
    method: "POST",
    schema: {
      tags: ["V1/Book/User"],
      summary: "Update book rating",
      description: "Set a rating for a specific book",
      body: RatingBody,
      response: { 200: RatingResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof RatingBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof RatingResponse.static> {
      const userId = (req as any).session.user.id;
      const { bookId, rating } = req.body;

      const result = await ratingService(userId, bookId, rating);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.detail.success),
        data: result.data,
      });
    },
  });
};

export default userRatingRoute;
