import { db } from "../../../../../db/db-pool.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { createUniqueFileName } from "../../../../../utils/my-utils.ts";
import {
  getPackageThumbnailUrl,
  savePackageThumbnail,
  deletePackageThumbnail,
} from "../../../../../utils/exam/exam-utils.ts";
import type { UploadedFile } from "../../../../../types/file.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { ThumbnailResponseDataT } from "../../packages.schema.ts";

export interface ThumbnailResult extends ServiceResponse {
  data?: ThumbnailResponseDataT;
}

export async function thumbnailService(
  id: string,
  action: string | undefined,
  file: UploadedFile | null,
): Promise<ThumbnailResult> {
  // Check if package exists
  const [existingPackage] = await db
    .select({
      id: examPackages.id,
      thumbnail: examPackages.thumbnail,
      createdAt: examPackages.createdAt,
    })
    .from(examPackages)
    .where(eq(examPackages.id, id))
    .limit(1);

  if (!existingPackage) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.detail.notFound,
    };
  }

  // Handle REMOVE action
  if (action === "remove") {
    if (existingPackage.thumbnail) {
      await deletePackageThumbnail(existingPackage.thumbnail);
    }

    const [updated] = await db
      .update(examPackages)
      .set({ thumbnail: null, updatedAt: new Date() })
      .where(eq(examPackages.id, id))
      .returning();

    return {
      success: true,
      data: {
        id: updated.id,
        thumbnail: null,
      },
    };
  }

  // Handle UPLOAD action
  if (!file) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.exam.packages.thumbnail.noFileUploaded,
    };
  }

  // Validate file type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.exam.packages.thumbnail.invalidFileType,
    };
  }

  // Validate file size (5MB max for package thumbnails)
  const maxSize = 5 * 1024 * 1024;
  if (file.buffer.length > maxSize) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.exam.packages.thumbnail.fileSizeTooLarge,
    };
  }

  // If existing thumbnail, delete it first
  if (existingPackage.thumbnail) {
    try {
      await deletePackageThumbnail(existingPackage.thumbnail);
    } catch (err) {
      // Continue even if delete fails
    }
  }

  // Process image: Resize to 600px width for Hero/Card balance
  const fileName = createUniqueFileName(file.filename, "pkg_thumb", "jpg");
  const processedBuffer = await sharp(file.buffer)
    .resize(600)
    .jpeg({ quality: 85, force: false })
    .toBuffer();

  const relativePath = await savePackageThumbnail(
    id,
    processedBuffer,
    fileName,
    "image/jpeg",
    existingPackage.createdAt,
  );

  // Update database
  const [updated] = await db
    .update(examPackages)
    .set({
      thumbnail: relativePath,
      updatedAt: new Date(),
    })
    .where(eq(examPackages.id, id))
    .returning();

  return {
    success: true,
    data: {
      id: updated.id,
      thumbnail: getPackageThumbnailUrl(updated.thumbnail),
    },
  };
}
