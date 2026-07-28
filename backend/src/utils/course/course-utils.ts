import { saveFile, deleteFile, deleteStorageDirectory } from "../../platform/storage/storage.ts";
import env from "../../config/env.config.ts";

/**
 * Returns the public URL for a course thumbnail.
 */
export const getCourseThumbnailUrl = (thumbnailPath: string | null | undefined): string | null => {
  if (!thumbnailPath) {
    return null;
  }

  // If it's already a full URL, return as is
  if (thumbnailPath.startsWith("http")) {
    return thumbnailPath;
  }

  const uploadsDir = env.server.uploadsDir;
  const cleanPath = thumbnailPath.startsWith("/") ? thumbnailPath.substring(1) : thumbnailPath;

  if (env.server.useS3Storage) {
    const s3Url = env.server.s3Storage.publicUrl;
    return `${s3Url}/${uploadsDir}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
  }

  const baseUrl = env.server.baseUrl;
  return `${baseUrl}/${uploadsDir}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
};

/**
 * Saves a course thumbnail to storage (Local or S3).
 * Returns the relative path for database storage (EXCLUDING uploadsDir).
 *
 * Pattern: course/YYYY-MM/courseId/filename
 */
export const saveCourseThumbnail = async (
  courseId: string,
  buffer: Buffer,
  fileName: string,
  mimetype: string,
  createdAt?: Date | string,
): Promise<string> => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const subDir = env.server.uploadsCourseDir; // "course"

  const relativePath = `${subDir}/${yearMonth}/${courseId}/${fileName}`.replace(/\/+/g, "/");

  await saveFile(relativePath, buffer, mimetype);

  return relativePath;
};

/**
 * Deletes a course thumbnail file from storage.
 */
export const deleteCourseThumbnail = async (thumbnailPath: string): Promise<void> => {
  await deleteFile(thumbnailPath);
};

/**
 * Deletes the entire storage directory for a course.
 */
export const deleteCourseDirectory = async (
  courseId: string,
  createdAt: Date | string,
): Promise<void> => {
  const subDir = env.server.uploadsCourseDir;
  await deleteStorageDirectory(subDir, courseId, createdAt);
};
