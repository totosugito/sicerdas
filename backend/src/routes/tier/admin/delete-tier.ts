import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { deleteTierService } from "../../../modules/tier/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const deleteTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/:slug",
    method: "DELETE",
    schema: {
      tags: ["App Tier"],
      params: Type.Object({
        slug: Type.String(),
      }),
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { slug: string } }>,
      reply: FastifyReply
    ): Promise<typeof BaseResponseSchema.static> {
      const { slug } = request.params;
      const result = await deleteTierService(slug);

      if (!result.success) {
        const message = request.t(
          result.errorKey!,
          result.extraData ? { count: result.extraData.count } : undefined
        );
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.appTier.delete.success),
      });
    },
  });
};

export default deleteTierPricingRoute;
