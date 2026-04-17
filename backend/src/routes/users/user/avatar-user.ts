import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/db-pool.ts";
import { users } from "../../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import type { UploadedFile } from "../../../types/file.ts";
import { createUniqueFileName } from "../../../utils/my-utils.ts";
import { Type } from "@sinclair/typebox";
import type { FastifyReply } from "fastify";
import { getUserAvatarUrl, saveUserAvatar, deleteUserAvatar } from "../../../utils/user-utils.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

export const processChangeAvatar = async (
  req: any,
  reply: FastifyReply,
  userId: string,
  file: UploadedFile,
) => {
  const { t } = getTypedI18n(req);
  const { buffer, filename: originalName, mimetype } = file;

  // Validate file type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(mimetype)) {
    return reply.status(400).send({
      success: false,
      message: t(($) => $.user.invalidFileType),
    });
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (buffer.length > maxSize) {
    return reply.status(400).send({
      success: false,
      message: t(($) => $.user.fileSizeTooLarge),
    });
  }

  // Generate a unique filename with cleaned name
  const fileName = createUniqueFileName(originalName, "avatar", "jpg");

  // Get current user to check for existing avatar and get createdAt for folder structure
  const [currentUser] = await db
    .select({
      userId: users.id,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // If user has an existing avatar, delete the old file
  if (currentUser?.image) {
    try {
      // image now contains the full relative path
      await deleteUserAvatar(currentUser.image);
    } catch (_error: unknown) {
      // Continue with the upload even if deletion fails
    }
  }

  // Process and save the image with sharp
  const processedImage = await sharp(buffer)
    .resize(400) // Set width to 400px, height will be calculated automatically to maintain aspect ratio
    .jpeg({ quality: 90, force: false }) // Convert to JPEG with 90% quality if not already
    .toBuffer();

  const finalPath = await saveUserAvatar(
    userId,
    processedImage,
    fileName,
    "image/jpeg",
    currentUser.createdAt,
  );

  // Update user's avatar in the database with the full relative path
  const [updatedUser] = await db
    .update(users)
    .set({
      image: finalPath,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return {
    success: true,
    message: t(($) => $.user.avatarUpdatedSuccessfully),
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      image: getUserAvatarUrl(userId, updatedUser.image), // Return the public URL
    },
  };
};

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/avatar",
    method: "PATCH",
    schema: {
      tags: ["User"],
      summary: "",
      description: "Upload and update the current user's avatar",
      consumes: ["multipart/form-data"],
      querystring: Type.Object({
        action: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean({ default: true }),
          message: Type.String(),
          data: Type.Object({
            id: Type.String(),
            name: Type.String(),
            image: Type.Union([Type.String(), Type.Null()]),
          }),
        }),
        // Updated to use proper HTTP status codes with Fastify Sensible
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
    handler: withErrorHandler(async (req, reply) => {
      const { t } = getTypedI18n(req);
      // User ID is available from the session (handled by user.hook.ts)
      const userId = req.session.user.id;

      // Type the query parameters
      const query = req.query as { action?: string };

      // Check if this is a remove avatar request
      const action = query.action;
      if (action === "remove") {
        // Get current user to delete the file
        const [currentUser] = await db
          .select({ image: users.image })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (currentUser?.image) {
          await deleteUserAvatar(currentUser.image);
        }

        // Remove the user's avatar from DB
        const [updatedUser] = await db
          .update(users)
          .set({
            image: null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
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

      // Get the uploaded file from the request
      const data = await req.file();

      if (!data) {
        return reply.badRequest(t(($) => $.user.noFileUploaded));
      }

      // Convert to our UploadedFile type
      const file: UploadedFile = {
        buffer: await data.toBuffer(),
        filename: data.filename,
        mimetype: data.mimetype,
      };

      return processChangeAvatar(req, reply, userId, file);
    }),
  });
};

export default protectedRoute;
