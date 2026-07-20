import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";
import {
  PackageIdParams,
  UpdatePackageBody,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { updatePackageService } from "../../../../modules/exam/packages/services/admin/update-package.service.ts";

const updatePackageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Packages"],
      params: PackageIdParams,
      body: UpdatePackageBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof PackageIdParams.static;
        Body: typeof UpdatePackageBody.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id } = request.params;

      const result = await updatePackageService(id, request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.packages.update.success),
      });
    },
  });
};

export default updatePackageRoute;
