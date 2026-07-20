import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";
import { PackageIdParams } from "../../../../modules/exam/packages/packages.schema.ts";
import { deletePackageService } from "../../../../modules/exam/packages/services/admin/delete-package.service.ts";

const deletePackageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Packages"],
      params: PackageIdParams,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof PackageIdParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id } = request.params;

      const result = await deletePackageService(id);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.packages.delete.success),
      });
    },
  });
};

export default deletePackageRoute;
