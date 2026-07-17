import { saveFile, deleteFile, deleteStorageDirectory } from "../platform/storage/storage.ts";
import env from "../config/env.config.ts";

/**
 * Returns the public URL for a package thumbnail.
 */
export const getPackageThumbnailUrl = (thumbnailPath: string | null | undefined): string | null => {
  if (!thumbnailPath) {
    return null;
  }

  // If it's already a full URL, return as is
  if (thumbnailPath.startsWith("http")) {
    return thumbnailPath;
  }

  // Ensure absolute path from baseUrl and uploadsDir
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
 * Saves a package thumbnail to storage (Local or S3).
 * Returns the relative path for database storage (EXCLUDING uploadsDir).
 *
 * Pattern: exam/package/YYYY-MM/packageId/filename
 */
export const savePackageThumbnail = async (
  packageId: string,
  buffer: Buffer,
  fileName: string,
  mimetype: string,
  createdAt?: Date | string,
): Promise<string> => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const subDir = env.server.uploadsPackageDir; // e.g. "exam/package"

  // Relative path inside the uploads directory
  const relativePath = `${subDir}/${yearMonth}/${packageId}/${fileName}`.replace(/\/+/g, "/");

  await saveFile(relativePath, buffer, mimetype);

  return relativePath;
};

/**
 * Deletes a package thumbnail from storage (Local or S3).
 */
export const deletePackageThumbnail = async (thumbnailPath: string): Promise<void> => {
  await deleteFile(thumbnailPath);
};

/**
 * Deletes the entire thumbnail directory for a package.
 */
export const deletePackageDirectory = async (
  packageId: string,
  createdAt: Date | string,
): Promise<void> => {
  const subDir = env.server.uploadsPackageDir;
  await deleteStorageDirectory(subDir, packageId, createdAt);
};
