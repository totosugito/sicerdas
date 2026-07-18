import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listSyncPeriodicService } from "../../modules/periodic-table/services/list-sync-periodic.service.ts";
import { PeriodicSyncResponse } from "../../modules/periodic-table/periodic-table-sync.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const periodicTableRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/periodic-table",
    method: "GET",
    schema: {
      tags: ["V1/App"],
      summary: "Get all periodic table data",
      description: "Returns all periodic table elements and notes for offline client sync",
      response: {
        200: PeriodicSyncResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest,
      reply: FastifyReply,
    ): Promise<typeof PeriodicSyncResponse.static> {
      const result = await listSyncPeriodicService();

      if (!result.success || !result.data) {
        return reply.internalServerError(req.t(($) => $.periodic.downloadFailed));
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.periodic.success),
        data: result.data,
      });
    },
  });
};

export default periodicTableRoute;
