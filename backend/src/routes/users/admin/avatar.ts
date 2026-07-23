import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { avatarUpdateService, AvatarResponseSchema, type AvatarUpdateResponse } from "../../../modules/users/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const updateAvatar: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/avatar",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Upload and update any user's avatar (Admin only)",
      description: "Allows administrators to update or remove any user's avatar image.",
      consumes: ["multipart/form-data"],
      querystring: Type.Object({
        action: Type.Optional(Type.String()),
      }),
      response: {
        200: AvatarResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      let targetUserId = (request.query as any).id as string | undefined;
      let action = (request.query as any).action as string | undefined;
      let uploadedFile: any = null;

      // Iterate through multipart parts to collect fields and optional file
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file") {
          uploadedFile = part;
          break;
        } else {
          if (part.fieldname === "id") targetUserId = part.value as string;
          if (part.fieldname === "action") action = part.value as string;
        }
      }

      if (!targetUserId) {
        return reply.badRequest(request.t(($) => $.user.management.missingUserId));
      }

      let fileParam = undefined;
      if (uploadedFile) {
        fileParam = {
          buffer: await uploadedFile.toBuffer(),
          filename: uploadedFile.filename,
          mimetype: uploadedFile.mimetype,
        };
      }

      const result: AvatarUpdateResponse = await avatarUpdateService({
        userId: targetUserId,
        action,
        file: fileParam,
      });

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) =>
          action === "remove" ? $.user.avatarRemovedSuccessfully : $.user.avatarUpdatedSuccessfully,
        ),
        data: result.data,
      });
    },
  });
};

export default updateAvatar;
