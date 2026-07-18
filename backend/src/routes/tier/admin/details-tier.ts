import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { detailsTierService, TierResponse } from "../../../modules/tier/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const detailsTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/:slug",
    method: "GET",
    schema: {
      tags: ["App Tier"],
      params: Type.Object({
        slug: Type.String(),
      }),
      response: {
        200: TierResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ): Promise<typeof TierResponse.static> {
      const { slug } = request.params;
      const result = await detailsTierService(slug);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.appTier.details.found),
        data: result.data,
      });
    },
  });
};

export default detailsTierPricingRoute;
