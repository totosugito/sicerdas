import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listSectionService } from "../../../modules/exam/package-sections/services/list-section.service.ts";
import { ListSectionBody, ListSectionResponse } from "../../../modules/exam/package-sections/package-sections.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from "better-auth/node";

const listSectionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.post("/list", {
    schema: {
      tags: ["Exam Package Sections"],
      summary: "List sections for an exam package",
      description:
        "Returns a list of active sections for a specific exam package, including user progress and best scores if authenticated.",
      body: ListSectionBody,
      response: {
        200: ListSectionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof ListSectionBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListSectionResponse.static> {
      // Manually fetch session
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      const userId = session?.user?.id;

      const result = await listSectionService(req.body, userId);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.package_sections.list.success),
        data: result.data,
      });
    },
  });
};

export default listSectionsRoute;
