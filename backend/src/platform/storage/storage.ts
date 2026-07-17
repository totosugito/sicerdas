import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import env from "../../config/env.config.ts";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { rm, writeFile, unlink } from "node:fs/promises";

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
 * Saves a file to storage (Local or S3/R2).
 * @param relativePath The relative path under the uploads folder (e.g. "users/2026-04/...")
 */
export const saveFile = async (
  relativePath: string,
  buffer: Buffer,
  mimetype: string,
): Promise<void> => {
  const uploadsDir = env.server.uploadsDir;

  if (env.server.useS3Storage) {
    // S3/R2 STORAGE
    const key = `${uploadsDir}/${relativePath}`.replace(/\/+/g, "/");
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
    const fullPath = join(
      process.cwd(),
      env.server.uploadsRelativePath,
      uploadsDir,
      relativePath,
    );

    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    await writeFile(fullPath, buffer);
  }
};

/**
 * Deletes a file from storage (Local or S3/R2).
 * @param relativePath The relative path under the uploads folder (e.g. "users/2026-04/...")
 */
export const deleteFile = async (
  relativePath: string,
  logger?: any,
): Promise<void> => {
  const uploadsDir = env.server.uploadsDir;

  if (env.server.useS3Storage) {
    // S3/R2 STORAGE
    const key = `${uploadsDir}/${relativePath}`.replace(/\/+/g, "/").replace(/^\/+/, "");
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.server.s3Storage.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      if (logger?.error) {
        logger.error({ err: error, key }, "Error deleting object from S3");
      } else {
        console.error(`Error deleting object from S3 at ${key}:`, error);
      }
    }
  } else {
    // LOCAL STORAGE
    const filePath = join(
      process.cwd(),
      env.server.uploadsRelativePath,
      uploadsDir,
      relativePath,
    );

    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (error) {
        if (logger?.error) {
          logger.error({ err: error, filePath }, "Error deleting file from disk");
        } else {
          console.error(`Error deleting file from disk at ${filePath}:`, error);
        }
      }
    }
  }
};

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
