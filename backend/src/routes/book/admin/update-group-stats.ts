import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { updateGroupStatsService } from "../../../modules/book/services/update-group-stats.service.ts";
import { GroupStatsResponse } from "../../../modules/book/book.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const adminRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update-group-stats/:groupId",
    method: "POST",
    schema: {
      tags: ["Admin/Book"],
      summary: "Update book group statistics",
      description: "Recalculate and update the book total count for a specific book group",
      params: Type.Object({ groupId: Type.Number() }),
      response: { 200: GroupStatsResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: { groupId: number } }>,
      reply: FastifyReply,
    ): Promise<typeof GroupStatsResponse.static> {
      const { groupId } = req.params;
      const result = await updateGroupStatsService(groupId);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.groupStats.updateSuccess),
        data: result.data,
      });
    },
  });
};

export default adminRoute;
