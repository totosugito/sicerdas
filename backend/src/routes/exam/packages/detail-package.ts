import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import {
  PackageIdParams,
  PublicPackageDetailResponse,
} from "../../../modules/exam/packages/packages.schema.ts";
import { publicDetailPackageService } from "../../../modules/exam/packages/services/detail-package.service.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumContentType } from "../../../db/schema/enum/enum-app.ts";

const packageDetailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Exam Packages"],
      summary: "Get exam package detail",
      description: "Get detailed information about a specific exam package by its ID",
      params: PackageIdParams,
      response: {
        200: PublicPackageDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof PackageIdParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof PublicPackageDetailResponse.static> {
      const { id } = req.params;

      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      const isLoggedIn = !!session?.user;
      const userId = isLoggedIn ? session?.user?.id : null;
      const latestVersionId = app.versionCache.get(EnumContentType.EXAM);
      const sessionId = req.cookies?.sessionId || null;

      const result = await publicDetailPackageService(
        id,
        userId,
        latestVersionId,
        req.ip,
        sessionId,
        req.headers["user-agent"],
      );

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.packages.detail.success),
        data: result.data!,
      });
    },
  });
};

export default packageDetailRoute;
