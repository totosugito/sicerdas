import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { adminListSectionService } from "../../../../modules/exam/package-sections/services/admin/list-section.service.ts";
import { AdminSectionListBody, AdminSectionListResponse } from "../../../../modules/exam/package-sections/package-sections.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { getAuthInstance } from "../../../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from "better-auth/node";
import { EnumUserRole } from "../../../../db/schema/index.ts";
import { EnumContentType } from "../../../../db/schema/enum/enum-app.ts";

const listSectionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Sections"],
      body: AdminSectionListBody,
      response: {
        200: AdminSectionListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AdminSectionListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof AdminSectionListResponse.static> {
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      const user = session?.user;
      const isAdmin = user?.role === EnumUserRole.ADMIN;
      const latestVersionId = (app as any).versionCache?.get(EnumContentType.EXAM);

      const result = await adminListSectionService(request.body, isAdmin, latestVersionId);

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

export default listSectionsRoute;
