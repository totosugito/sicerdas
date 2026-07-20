import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AdminPackageListBody,
  AdminPackageListResponse,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { adminListPackageService } from "../../../../modules/exam/packages/services/admin/list-package.service.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../../decorators/auth.decorator.ts";
import { EnumUserRole } from "../../../../db/schema/index.ts";
import { EnumContentType } from "../../../../db/schema/enum/enum-app.ts";

const listPackagesRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Admin Exam Packages"],
      body: AdminPackageListBody,
      response: {
        200: AdminPackageListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AdminPackageListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof AdminPackageListResponse.static> {
      // Determine user role from session
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      const user = session?.user;
      const isAdmin = user?.role === EnumUserRole.ADMIN;

      const latestVersionId = (app as any).versionCache.get(EnumContentType.EXAM);

      const result = await adminListPackageService(request.body, isAdmin, latestVersionId);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.packages.list.success),
        data: result.data!,
      });
    },
  });
};

export default listPackagesRoute;
