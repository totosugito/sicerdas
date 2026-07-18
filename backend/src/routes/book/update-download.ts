import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { updateDownloadService } from "../../modules/book/services/update-download.service.ts";
import { DownloadBody, DownloadResponse } from "../../modules/book/book.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const updateDownloadRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update-download",
    method: "POST",
    schema: {
      tags: ["V1/Book"],
      summary: "Update book download count",
      body: DownloadBody,
      response: { 200: DownloadResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof DownloadBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof DownloadResponse.static> {
      const session = await getAuthInstance(app).api.getSession({ headers: fromNodeHeaders(req.headers) });
      const userId = session?.user?.id;
      const sessionId = (req as any).cookies?.sessionId;

      const result = await updateDownloadService(req.body.id, req.body.bookId, userId, sessionId, req.ip, req.headers["user-agent"]);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.book.download.updated),
        data: result.data,
      });
    },
  });
};

export default updateDownloadRoute;
