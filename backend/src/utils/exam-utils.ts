import { join } from "node:path";
import { writeFile, unlink, rm } from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import {
  s3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "./storage.ts";
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

  return `${env.server.baseUrl}/${uploadsDir}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
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

  if (env.server.useS3Storage) {
    // S3/R2 STORAGE
    const key = `${env.server.uploadsDir}/${relativePath}`.replace(/\/+/g, "/");
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.server.s3Storage.bucketName,
        Key: key.startsWith("/") ? key.substring(1) : key,
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
      packageId,
    );

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
  }

  return relativePath;
};

/**
 * Deletes a package thumbnail from storage (Local or S3).
 */
export const deletePackageThumbnail = async (thumbnailPath: string): Promise<void> => {
  const uploadsDir = env.server.uploadsDir;

  if (env.server.useS3Storage) {
    // S3/R2 STORAGE
    const key = `${uploadsDir}/${thumbnailPath}`.replace(/\/+/g, "/").replace(/^\/+/, "");

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.server.s3Storage.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error(`[ExamUtils] Error deleting thumbnail from S3 at ${thumbnailPath}:`, error);
    }
  } else {
    // LOCAL STORAGE
    const filePath = join(process.cwd(), env.server.uploadsRelativePath, uploadsDir, thumbnailPath);

    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`[ExamUtils] Error deleting thumbnail from disk at ${thumbnailPath}:`, error);
      }
    }
  }
};

/**
 * Deletes the entire thumbnail directory for a package.
 */
export const deletePackageDirectory = async (
  packageId: string,
  createdAt: Date | string,
): Promise<void> => {
  const date = new Date(createdAt);
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const subDir = env.server.uploadsPackageDir;

  if (env.server.useS3Storage) {
    // S3/R2 STORAGE
    const prefix = `${env.server.uploadsDir}/${subDir}/${yearMonth}/${packageId}/`
      .replace(/\/+/g, "/")
      .replace(/^\/+/, "");

    try {
      const listParams = {
        Bucket: env.server.s3Storage.bucketName,
        Prefix: prefix,
      };

      const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

      const deleteParams = {
        Bucket: env.server.s3Storage.bucketName,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
        },
      };

      await s3Client.send(new DeleteObjectsCommand(deleteParams));

      if (listedObjects.IsTruncated) {
        await deletePackageDirectory(packageId, createdAt);
      }
    } catch (error) {
      console.error(
        `[ExamUtils] Error deleting package directory from S3 prefix ${prefix}:`,
        error,
      );
    }
  } else {
    // LOCAL STORAGE
    const dirPath = join(
      process.cwd(),
      env.server.uploadsRelativePath,
      env.server.uploadsDir,
      subDir,
      yearMonth,
      packageId,
    );

    if (existsSync(dirPath)) {
      try {
        await rm(dirPath, { recursive: true, force: true });
      } catch (error) {
        console.error(`[ExamUtils] Error deleting package directory from disk:`, error);
      }
    }
  }
};
