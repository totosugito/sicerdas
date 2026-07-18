import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { updateTierService, TierResponse, UpdateTierBody } from "../../../modules/tier/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const UpdateTierParams = Type.Object({
  slug: Type.String(),
});

const updateTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/:slug",
    method: "PATCH",
    schema: {
      tags: ["App Tier"],
      params: UpdateTierParams,
      body: UpdateTierBody,
      response: {
        200: TierResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof UpdateTierParams.static; Body: typeof UpdateTierBody.static }>,
      reply: FastifyReply
    ): Promise<typeof TierResponse.static> {
      const { slug } = request.params;
      const result = await updateTierService(slug, request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.appTier.update.success),
        data: result.data,
      });
    },
  });
};

export default updateTierPricingRoute;
