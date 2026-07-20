import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AdminPackageSimpleBody,
  AdminPackageSimpleListResponse,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { adminListPackageSimpleService } from "../../../../modules/exam/packages/services/admin/list-package-simple.service.ts";

const listPackagesSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Exam Packages"],
      body: AdminPackageSimpleBody,
      response: {
        200: AdminPackageSimpleListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AdminPackageSimpleBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof AdminPackageSimpleListResponse.static> {
      const result = await adminListPackageSimpleService(request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.packages.listSimple.success),
        data: result.data!,
      });
    },
  });
};

export default listPackagesSimpleRoute;
