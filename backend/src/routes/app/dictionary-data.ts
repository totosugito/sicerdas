import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listDictionaryService } from "../../modules/dictionary/services/list-dictionary.service.ts";
import { DictionaryDataResponse } from "../../modules/dictionary/dictionary.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const dictionaryDataRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/dictionary-data",
    method: "GET",
    schema: {
      tags: ["V1/App"],
      summary: "Get dictionary package list",
      description: "Returns the list of dictionary database packages",
      response: {
        200: DictionaryDataResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest,
      reply: FastifyReply,
    ): Promise<typeof DictionaryDataResponse.static> {
      const result = await listDictionaryService();

      if (!result.success || !result.data) {
        return reply.internalServerError(req.t(($) => $.dictionary.success));
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.dictionary.success),
        data: result.data,
      });
    },
  });
};

export default dictionaryDataRoute;
