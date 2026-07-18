import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { listAppTierService, TierResponseItem } from "../../modules/tier/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../types/response.ts";

const ListTierResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(TierResponseItem),
  }),
]);

const clientTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/app-tier",
    method: "GET",
    schema: {
      tags: ["App Tier"],
      response: {
        200: ListTierResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<typeof ListTierResponse.static> {
      const tiers = await listAppTierService();

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.appTier.listSuccess),
        data: tiers,
      });
    },
  });
};

export default clientTierPricingRoute;
