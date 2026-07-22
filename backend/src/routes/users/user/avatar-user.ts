import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { avatarUpdateService, AvatarResponseSchema, type AvatarUpdateResponse } from "../../../modules/users/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/avatar",
    method: "PATCH",
    schema: {
      tags: ["User"],
      description: "Upload and update the current user's avatar",
      consumes: ["multipart/form-data"],
      querystring: Type.Object({
        action: Type.Optional(Type.String()),
      }),
      response: {
        200: AvatarResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
      // User ID is available from the session (handled by user.hook.ts)
      const userId = req.session.user.id;

      // Type the query parameters
      const query = req.query as { action?: string };
      const action = query.action;

      let fileParam = undefined;
      if (action !== "remove") {
        const data = await req.file();
        if (!data) {
          return reply.badRequest(req.t(($) => $.user.noFileUploaded));
        }

        fileParam = {
          buffer: await data.toBuffer(),
          filename: data.filename,
          mimetype: data.mimetype,
        };
      }

      const result: AvatarUpdateResponse = await avatarUpdateService({
        userId,
        action,
        file: fileParam,
      });

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) =>
          action === "remove" ? $.user.avatarRemovedSuccessfully : $.user.avatarUpdatedSuccessfully,
        ),
        data: result.data,
      });
    },
  });
};

export default protectedRoute;
