import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  PackageIdParams,
  AdminPackageDetailResponse,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { adminDetailPackageService } from "../../../../modules/exam/packages/services/admin/detail-package.service.ts";
import { EnumContentType } from "../../../../db/schema/enum/enum-app.ts";

const detailPackageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Admin Exam Packages"],
      summary: "Get exam package detail",
      description: "Get detailed information about a specific exam package by its ID",
      params: PackageIdParams,
      response: {
        200: AdminPackageDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof PackageIdParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof AdminPackageDetailResponse.static> {
      const { id } = request.params;
      const latestVersionId = (app as any).versionCache.get(EnumContentType.EXAM);

      const result = await adminDetailPackageService(id, latestVersionId);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.packages.detail.success),
        data: result.data!,
      });
    },
  });
};

export default detailPackageRoute;
