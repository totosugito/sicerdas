import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import env from "../config/env.config.ts";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { rm } from "node:fs/promises";

export const s3Client = new S3Client({
  region: env.server.s3Storage.region || "auto",
  endpoint: env.server.s3Storage.endpoint,
  credentials: {
    accessKeyId: env.server.s3Storage.accessKeyId || "",
    secretAccessKey: env.server.s3Storage.secretAccessKey || "",
  },
});

export { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand };

/**
 * Deletes the entire directory associated with an entity (e.g., user, exam question, passage)
 */
export const deleteStorageDirectory = async (
  subDir: string,
  entityId: string,
  createdAt: Date | string,
  logger?: any,
): Promise<void> => {
  const date = new Date(createdAt);
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  if (env.server.useS3Storage) {
    // S3/R2 STORAGE
    const prefix = `${env.server.uploadsDir}/${subDir}/${yearMonth}/${entityId}/`
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

      // Handle pagination if more than 1000 objects (rare for a single entity but good practice)
      if (listedObjects.IsTruncated) {
        await deleteStorageDirectory(subDir, entityId, createdAt, logger);
      }
    } catch (error) {
      if (logger?.error) {
        logger.error({ err: error, prefix }, "Error deleting entity prefix from S3");
      }
    }
  } else {
    // LOCAL STORAGE
    const dirPath = join(
      process.cwd(),
      env.server.uploadsRelativePath,
      env.server.uploadsDir,
      subDir,
      yearMonth,
      entityId,
    );

    if (existsSync(dirPath)) {
      try {
        await rm(dirPath, { recursive: true, force: true });
      } catch (error) {
        if (logger?.error) {
          logger.error({ err: error, dirPath }, "Error deleting entity directory from disk");
        }
      }
    }
  }
};
