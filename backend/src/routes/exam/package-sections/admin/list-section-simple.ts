import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { adminListSectionSimpleService } from "../../../../modules/exam/package-sections/services/admin/list-section-simple.service.ts";
import { AdminSectionSimpleBody, AdminSectionSimpleListResponse } from "../../../../modules/exam/package-sections/package-sections.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const listSectionsSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Sections"],
      body: AdminSectionSimpleBody,
      response: {
        200: AdminSectionSimpleListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AdminSectionSimpleBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof AdminSectionSimpleListResponse.static> {
      const result = await adminListSectionSimpleService(request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.package_sections.list.success),
        data: result.data,
      });
    },
  });
};

export default listSectionsSimpleRoute;
