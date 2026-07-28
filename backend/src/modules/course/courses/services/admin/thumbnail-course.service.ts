import { db } from "../../../../../db/db-pool.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { createUniqueFileName } from "../../../../../utils/my-utils.ts";
import {
  getCourseThumbnailUrl,
  saveCourseThumbnail,
  deleteCourseThumbnail,
} from "../../../../../utils/course/course-utils.ts";
import type { UploadedFile } from "../../../../../types/file.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { ThumbnailResponseDataT } from "../../courses.schema.ts";

export interface ThumbnailResult extends ServiceResponse {
  data?: ThumbnailResponseDataT;
}

export async function courseThumbnailService(
  id: string,
  action: string | undefined,
  file: UploadedFile | null,
): Promise<ThumbnailResult> {
  // Check if course exists
  const [existingCourse] = await db
    .select({
      id: courses.id,
      thumbnail: courses.thumbnail,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!existingCourse) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.courses.notFound,
    };
  }

  // Handle REMOVE action
  if (action === "remove") {
    if (existingCourse.thumbnail) {
      await deleteCourseThumbnail(existingCourse.thumbnail);
    }

    const [updated] = await db
      .update(courses)
      .set({ thumbnail: null, updatedAt: new Date() })
      .where(eq(courses.id, id))
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

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.buffer.length > maxSize) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.exam.packages.thumbnail.fileSizeTooLarge,
    };
  }

  // If existing thumbnail, delete it first
  if (existingCourse.thumbnail) {
    try {
      await deleteCourseThumbnail(existingCourse.thumbnail);
    } catch (err) {
      // Continue even if delete fails
    }
  }

  // Process image: Resize to 600px width for Hero/Card balance
  const fileName = createUniqueFileName(file.filename, "crs_thumb", "jpg");
  const processedBuffer = await sharp(file.buffer)
    .resize(600)
    .jpeg({ quality: 85, force: false })
    .toBuffer();

  const relativePath = await saveCourseThumbnail(
    id,
    processedBuffer,
    fileName,
    "image/jpeg",
    existingCourse.createdAt,
  );

  // Update database
  const [updated] = await db
    .update(courses)
    .set({
      thumbnail: relativePath,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, id))
    .returning();

  return {
    success: true,
    data: {
      id: updated.id,
      thumbnail: getCourseThumbnailUrl(updated.thumbnail),
    },
  };
}
