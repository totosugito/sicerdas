import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import { deleteVersionService } from "../../../modules/version/services/admin/delete-version.service.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const DeleteVersionParams = Type.Object({
  id: Type.Number(),
});

const deleteVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Version"],
      params: DeleteVersionParams,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof DeleteVersionParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
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
