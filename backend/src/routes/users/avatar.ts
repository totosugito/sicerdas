import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { users } from "../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { createUniqueFileName } from "../../utils/my-utils.ts";
import { Type } from "@sinclair/typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserAvatarUrl, saveUserAvatar, deleteUserAvatar } from "../../utils/user-utils.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";

const AvatarResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
  data: Type.Optional(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      image: Type.Union([Type.String(), Type.Null()]),
    }),
  ),
});

const updateAvatar: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/avatar",
    method: "POST", // Changed to POST to match management conventions or keep as per app-api
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
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req: FastifyRequest, reply: FastifyReply) => {
      const { t } = getTypedI18n(req);

      // Get the multipart reader
      const data = await req.file();
      if (!data) {
        return reply.badRequest(t(($) => $.user.noFileUploaded));
      }

      // Extract userId and action from fields or query
      const fields = data.fields as any;
      const targetUserId = fields.id?.value || (req.query as any).id;
      const action = fields.action?.value || (req.query as any).action;

      if (!targetUserId) {
        return reply.badRequest("Missing user ID (id) in request");
      }

      // Handle remove action
      if (action === "remove") {
        const [currentUser] = await db
          .select({ image: users.image })
          .from(users)
          .where(eq(users.id, targetUserId))
          .limit(1);

        if (!currentUser) {
          return reply.notFound(t(($) => $.user.userNotFound));
        }

        if (currentUser.image) {
          await deleteUserAvatar(currentUser.image);
        }

        const [updatedUser] = await db
          .update(users)
          .set({
            image: null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, targetUserId))
          .returning();

        return reply.status(200).send({
          success: true,
          message: t(($) => $.user.avatarRemovedSuccessfully),
          data: {
            id: updatedUser.id,
            name: updatedUser.name,
            image: null,
          },
        });
      }

      // Handle upload logic similar to avatar-user.ts but for target userId
      const {
        buffer,
        filename: originalName,
        mimetype,
      } = {
        buffer: await data.toBuffer(),
        filename: data.filename,
        mimetype: data.mimetype,
      };

      // Validate file type
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimeTypes.includes(mimetype)) {
        return reply.badRequest(t(($) => $.user.invalidFileType));
      }

      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return reply.badRequest(t(($) => $.user.fileSizeTooLarge));
      }

      // Get current user to check for existing avatar and get createdAt for folder structure
      const currentUser = await db.query.users.findFirst({
        where: (fields) => eq(fields.id, targetUserId),
      });

      if (!currentUser) {
        return reply.notFound(t(($) => $.user.userNotFound));
      }

      // Delete old file if exists
      if (currentUser.image) {
        try {
          await deleteUserAvatar(currentUser.image);
        } catch (_error) {
          // Continue even if deletion fails
        }
      }

      // Process image with Sharp
      const fileName = createUniqueFileName(originalName, "avatar", "jpg");
      const processedImage = await sharp(buffer)
        .resize(400)
        .jpeg({ quality: 90, force: false })
        .toBuffer();

      const finalPath = await saveUserAvatar(
        targetUserId as string,
        processedImage,
        fileName,
        "image/jpeg",
        currentUser.createdAt,
      );

      // Update DB
      const [updatedUser] = await db
        .update(users)
        .set({
          image: finalPath,
          updatedAt: new Date(),
        })
        .where(eq(users.id, targetUserId))
        .returning();

      return reply.status(200).send({
        success: true,
        message: t(($) => $.user.avatarUpdatedSuccessfully),
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          image: getUserAvatarUrl(targetUserId as string, updatedUser.image),
        },
      });
    }),
  });
};

export default updateAvatar;
