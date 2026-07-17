import { db } from "../../../db/db-pool.ts";
import { users } from "../../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { createUniqueFileName } from "../../../utils/my-utils.ts";
import { getUserAvatarUrl, saveUserAvatar, deleteUserAvatar } from "../../../utils/user/user-utils.ts";
import type { ServiceResponse } from "../../../types/response.ts";

export interface AvatarUpdateParams {
  userId: string;
  action?: string;
  file?: {
    buffer: Buffer;
    filename: string;
    mimetype: string;
  };
}

export interface AvatarUpdateResponse extends ServiceResponse {
  data?: {
    id: string;
    name: string;
    image: string | null;
  };
}

export async function avatarUpdateService(params: AvatarUpdateParams): Promise<AvatarUpdateResponse> {
  const { userId, action, file } = params;

  // Handle remove action
  if (action === "remove") {
    const currentUser = await db.query.users.findFirst({
      where: (fields) => eq(fields.id, userId),
    });

    if (!currentUser) {
      return {
        success: false,
        statusCode: 404,
        errorKey: ($) => $.user.userNotFound,
      };
    }

    if (currentUser.image) {
      try {
        await deleteUserAvatar(currentUser.image);
      } catch (_error) {
        // Continue even if deletion fails
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return {
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name || "",
        image: null,
      },
    };
  }

  // If not removing, then we MUST have a file
  if (!file) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.user.noFileUploaded,
    };
  }

  const { buffer, filename: originalName, mimetype } = file;

  // Validate file type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(mimetype)) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.user.invalidFileType,
    };
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024;
  if (buffer.length > maxSize) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.user.fileSizeTooLarge,
    };
  }

  // Get current user to check for existing avatar and get createdAt for folder structure
  const currentUser = await db.query.users.findFirst({
    where: (fields) => eq(fields.id, userId),
  });

  if (!currentUser) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.user.userNotFound,
    };
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
    userId,
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
    .where(eq(users.id, userId))
    .returning();

  return {
    success: true,
    data: {
      id: updatedUser.id,
      name: updatedUser.name || "",
      image: getUserAvatarUrl(userId, updatedUser.image),
    },
  };
}
