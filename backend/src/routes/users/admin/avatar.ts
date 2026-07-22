import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { avatarUpdateService } from "../../../modules/users/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const AvatarResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Optional(
      Type.Object({
        id: Type.String(),
        name: Type.String(),
        image: Type.Union([Type.String(), Type.Null()]),
      }),
    ),
  }),
]);

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
        200: AvatarResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
      let targetUserId = (req.query as any).id as string | undefined;
      let action = (req.query as any).action as string | undefined;
      let uploadedFile: any = null;

      // Iterate through multipart parts to collect fields and optional file
      const parts = req.parts();
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
        return reply.badRequest("Missing user ID (id) in request");
      }

      let fileParam = undefined;
      if (uploadedFile) {
        fileParam = {
          buffer: await uploadedFile.toBuffer(),
          filename: uploadedFile.filename,
          mimetype: uploadedFile.mimetype,
        };
      }

      const result = await avatarUpdateService({
        userId: targetUserId,
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

export default updateAvatar;
