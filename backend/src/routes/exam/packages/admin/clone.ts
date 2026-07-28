import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  ClonePackageBody,
  ClonePackageResponse,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { clonePackageService } from "../../../../modules/exam/packages/services/admin/clone-package.service.ts";

const clonePackageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/clone",
    method: "POST",
    schema: {
      tags: ["Admin Exam Packages"],
      body: ClonePackageBody,
      response: {
        201: ClonePackageResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof ClonePackageBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ClonePackageResponse.static> {
      const userId = request.session.user.id;

      const result = await clonePackageService(request.body, userId);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.exam.packages.create.success),
        data: result.data!,
      });
    },
  });
};

export default clonePackageRoute;
