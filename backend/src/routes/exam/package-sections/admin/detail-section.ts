import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { adminDetailSectionService } from "../../../../modules/exam/package-sections/services/admin/detail-section.service.ts";
import { AdminSectionDetailResponse } from "../../../../modules/exam/package-sections/package-sections.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { EnumContentType } from "../../../../db/schema/enum/enum-app.ts";

const DetailSectionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const detailSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Exam Package Sections"],
      params: DetailSectionParams,
      response: {
        200: AdminSectionDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof DetailSectionParams.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof AdminSectionDetailResponse.static> {
      const { id } = request.params;
      const latestVersionId = (app as any).versionCache?.get(EnumContentType.EXAM);

      const result = await adminDetailSectionService(id, latestVersionId);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.package_sections.detail.success),
        data: result.data,
      });
    },
  });
};

export default detailSectionRoute;
