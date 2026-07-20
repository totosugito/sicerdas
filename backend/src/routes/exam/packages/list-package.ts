import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import {
  PublicPackageListBody,
  PublicPackageListResponse,
} from "../../../modules/exam/packages/packages.schema.ts";
import { publicListPackageService } from "../../../modules/exam/packages/services/list-package.service.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumContentType } from "../../../db/schema/enum/enum-app.ts";

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Exam Packages"],
      summary: "List exam packages",
      description: "Get a paginated list of exam packages with filtering and sorting options",
      body: PublicPackageListBody,
      response: {
        200: PublicPackageListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof PublicPackageListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof PublicPackageListResponse.static> {
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      const isLoggedIn = !!session?.user;
      const userId = isLoggedIn ? session?.user?.id : null;
      const latestVersionId = app.versionCache.get(EnumContentType.EXAM);

      const result = await publicListPackageService(req.body, userId, latestVersionId);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.packages.list.success),
        data: result.data!,
      });
    },
  });
};

export default publicRoute;
