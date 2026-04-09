import { join } from "node:path";
import { writeFile, unlink } from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import { s3Client, PutObjectCommand, DeleteObjectCommand } from "./storage.ts";
import env from "../config/env.config.ts";

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

  // Ensure absolute path from baseUrl
  const cleanPath = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;

  return `${env.server.baseUrl}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
};

/**
 * Saves a user's avatar to storage (Local or S3).
 * Returns the relative path for database storage (including uploadsDir).
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

  // Full path relative to project root / bucket root, including uploadsDir
  const fullPath = `${env.server.uploadsDir}/${subDir}/${yearMonth}/${userId}/${fileName}`.replace(
    /\/+/g,
    "/",
  );

  if (env.server.useS3Storage) {
    // S3/R2 STORAGE
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.server.s3Storage.bucketName,
        Key: fullPath.startsWith("/") ? fullPath.substring(1) : fullPath,
        Body: buffer,
        ContentType: mimetype,
      }),
    );
  } else {
    // LOCAL STORAGE
    const uploadDir = join(
      process.cwd(),
      env.server.uploadsRelativePath,
      env.server.uploadsDir,
      subDir,
      yearMonth,
      userId,
    );

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
  }

  return fullPath;
};

/**
 * Deletes a user's avatar from storage (Local or S3).
 * @param avatarPath The full path stored in the database (e.g. "/uploads/users/2026-04/...")
 */
export const deleteUserAvatar = async (avatarPath: string): Promise<void> => {
  if (env.server.useS3Storage) {
    // S3/R2 STORAGE
    const key = avatarPath.replace(/\/+/g, "/").replace(/^\/+/, "");

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.server.s3Storage.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error(`Error deleting avatar from S3 at ${avatarPath}:`, error);
    }
  } else {
    // LOCAL STORAGE
    const filePath = join(process.cwd(), env.server.uploadsRelativePath, avatarPath);

    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Error deleting avatar from disk at ${avatarPath}:`, error);
      }
    }
  }
};
