import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { detailElementService } from "../../modules/periodic-table/services/detail-element.service.ts";
import { ElementResponse } from "../../modules/periodic-table/index.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const GetElementParams = Type.Object({
  atomicNumber: Type.Integer({ description: "Atomic number of the element to retrieve" }),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/element/:atomicNumber",
    method: "GET",
    schema: {
      tags: ["V1/Periodic"],
      summary: "Get element by atomic number",
      description:
        "Retrieve detailed information about a chemical element by its atomic number with optional localized notes",
      params: GetElementParams,
      response: {
        200: ElementResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof GetElementParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof ElementResponse.static> {
      const { atomicNumber } = request.params;
      const locale = request.headers["accept-language"] || "id";

      const result = await detailElementService(atomicNumber, locale);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.periodic.success),
        data: result.data,
      });
    },
  });
};

export default publicRoute;
