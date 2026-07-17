import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import { deleteVersionService } from "../../../modules/version/services/delete-version.service.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const DeleteVersionParams = Type.Object({
  id: Type.Number(),
});

const DeleteVersionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

const deleteVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Version"],
      params: DeleteVersionParams,
      response: {
        200: DeleteVersionResponse,
        "4xx": ErrorResponseSchema,
        "5xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof DeleteVersionParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof DeleteVersionResponse.static> {
      const { id } = request.params;

      const result = await deleteVersionService(id);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      // Refresh cache if it was published
      if (result.status === EnumContentStatus.PUBLISHED && result.dataType) {
        await app.versionCache.refresh(result.dataType as any);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.version.delete.success),
      });
    },
  });
};

export default deleteVersionRoute;
