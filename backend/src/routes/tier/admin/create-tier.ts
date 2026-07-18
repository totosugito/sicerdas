import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createTierService, CreateTierBody, TierResponse } from "../../../modules/tier/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";


const createTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create-tier",
    method: "POST",
    schema: {
      tags: ["App Tier"],
      body: CreateTierBody,
      response: {
        200: TierResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CreateTierBody.static }>,
      reply: FastifyReply
    ): Promise<typeof TierResponse.static> {
      const result = await createTierService(request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.appTier.create.success),
        data: result.data,
      });
    },
  });
};

export default createTierPricingRoute;
