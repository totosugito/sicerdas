import { saveFile, deleteFile } from "../../platform/storage/storage.ts";
import env from "../../config/env.config.ts";

/**
 * Returns the public URL for a user's avatar.
 */
export const getUserAvatarUrl = (
  userId: string,
  avatarPath: string | null | undefined,
): string | null => {
  if (!avatarPath) {
    return null;
  }

  // If it's already a full URL (e.g. Google OAuth), return as is
  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

  // Ensure absolute path from baseUrl and uploadsDir
  const uploadsDir = env.server.uploadsDir;
  const cleanPath = avatarPath.startsWith("/") ? avatarPath.substring(1) : avatarPath;
  
  if (env.server.useS3Storage) {
    const s3Url = env.server.s3Storage.publicUrl;
    return `${s3Url}/${uploadsDir}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
  }

  const baseUrl = env.server.baseUrl;
  return `${baseUrl}/${uploadsDir}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
};

/**
 * Saves a user's avatar to storage (Local or S3).
 * Returns the relative path for database storage (EXCLUDING uploadsDir).
 */
export const saveUserAvatar = async (
  userId: string,
  buffer: Buffer,
  fileName: string,
  mimetype: string,
  createdAt?: Date | string,
): Promise<string> => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const subDir = env.server.uploadsUserDir; // e.g. "users"

  // Relative path inside the uploads directory
  const relativePath = `${subDir}/${yearMonth}/${userId}/${fileName}`.replace(/\/+/g, "/");

  await saveFile(relativePath, buffer, mimetype);

  return relativePath;
};

/**
 * Deletes a user's avatar from storage (Local or S3).
 * @param avatarPath The relative path stored in the database (e.g. "users/2026-04/...")
 */
export const deleteUserAvatar = async (avatarPath: string): Promise<void> => {
  await deleteFile(avatarPath);
};
