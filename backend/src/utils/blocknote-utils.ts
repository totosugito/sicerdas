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
import { createUniqueFileName } from "./my-utils.ts";
import type { UploadedFile } from "../types/file.ts";

/**
 * Generates the relative URL for a BlockNote file
 */
export const getBlockNoteFileUrl = (
  subDir: string,
  yearMonth: string,
  entityId: string,
  fileName: string,
): string => {
  return `${env.server.uploadsDir}/${subDir}/${yearMonth}/${entityId}/${fileName}`.replace(
    /\/+/g,
    "/",
  );
};

/**
 * Extracts all unique URLs from BlockNote content
 */
export const extractBlockNoteUrls = (content: any[], types: string[] = ["image"]): string[] => {
  const urls: string[] = [];

  const traverse = (blocks: any[]) => {
    for (const block of blocks) {
      if (types.includes(block.type) && block.props?.url && typeof block.props.url === "string") {
        urls.push(block.props.url);
      }
      if (block.children && Array.isArray(block.children)) {
        traverse(block.children);
      }
    }
  };

  if (Array.isArray(content)) {
    traverse(content);
  }

  return Array.from(new Set(urls));
};

/**
 * Replaces temporary blob URLs or specific filenames with final public URLs in BlockNote content
 */
export const replaceBlockNoteUrls = (
  content: any[],
  urlMap: Record<string, string>,
  types: string[] = ["image"],
): any[] => {
  const traverse = (blocks: any[]): any[] => {
    return blocks.map((block) => {
      let newBlock = { ...block };

      if (types.includes(block.type) && block.props?.url && urlMap[block.props.url]) {
        newBlock.props = {
          ...newBlock.props,
          url: urlMap[block.props.url],
        };
      }

      if (block.children && Array.isArray(block.children)) {
        newBlock.children = traverse(block.children);
      }

      return newBlock;
    });
  };

  return traverse(content);
};

/**
 * Processes and saves uploaded BlockNote files, returning a map of original names to final URLs
 */
export const processBlockNoteFiles = async (
  subDir: string,
  entityId: string,
  files: UploadedFile[],
  createdAt?: Date | string,
): Promise<Record<string, string>> => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const urlMap: Record<string, string> = {};

  if (env.server.useS3Storage) {
    // S3/R2 STORAGE
    for (const file of files) {
      const fileName = createUniqueFileName(file.filename, "blocknote_file");
      // Key includes /uploads/ prefix to match local structure
      const key = `${env.server.uploadsDir}/${subDir}/${yearMonth}/${entityId}/${fileName}`.replace(
        /\/+/g,
        "/",
      );

      await s3Client.send(
        new PutObjectCommand({
          Bucket: env.server.s3Storage.bucketName,
          Key: key.startsWith("/") ? key.substring(1) : key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      urlMap[file.filename] = key;
    }
  } else {
    // LOCAL STORAGE
    const uploadDir = join(
      process.cwd(),
      env.server.uploadsRelativePath,
      env.server.uploadsDir,
      subDir,
      yearMonth,
      entityId,
    );

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of files) {
      const fileName = createUniqueFileName(file.filename, "blocknote_file");
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, file.buffer);

      // Save mapping using the original filename as the key
      urlMap[file.filename] = getBlockNoteFileUrl(subDir, yearMonth, entityId, fileName);
    }
  }

  return urlMap;
};

/**
 * Deletes files that are no longer referenced in the BlockNote content
 */
export const cleanupBlockNoteFiles = async (
  oldContent: any[],
  newContent: any[],
  subDir: string, // Unused for now but kept for consistency if path logic changes
  types: string[] = ["image"],
  logger?: any,
): Promise<void> => {
  const oldUrls = extractBlockNoteUrls(oldContent, types);
  const newUrls = extractBlockNoteUrls(newContent, types);

  const uploadsMark = env.server.uploadsDir;

  const getRelativePath = (url: string) => {
    const index = url.indexOf(uploadsMark);
    if (index !== -1) {
      return url.substring(index + uploadsMark.length).replace(/^\/+/, "");
    }
    return null;
  };

  const oldPaths = oldUrls.map(getRelativePath).filter((p): p is string => p !== null);
  const newPaths = newUrls.map(getRelativePath).filter((p): p is string => p !== null);

  const deletedPaths = oldPaths.filter((path) => !newPaths.includes(path));

  for (const relativePath of deletedPaths) {
    if (env.server.useS3Storage) {
      // S3/R2 STORAGE
      const key = `${env.server.uploadsDir}/${relativePath}`
        .replace(/\/+/g, "/")
        .replace(/^\/+/, "");
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: env.server.s3Storage.bucketName,
            Key: key,
          }),
        );
      } catch (error) {
        if (logger?.error) {
          logger.error({ err: error, key }, "Error deleting object from S3 during cleanup");
        }
      }
    } else {
      // LOCAL STORAGE
      const filePath = join(
        process.cwd(),
        env.server.uploadsRelativePath,
        env.server.uploadsDir,
        relativePath,
      );

      if (existsSync(filePath)) {
        try {
          await unlink(filePath);
        } catch (error) {
          if (logger?.error) {
            logger.error({ err: error, filePath }, "Error deleting file from disk during cleanup");
          }
        }
      }
    }
  }
};

/**
 * Deletes the entire directory associated with a BlockNote entity
 */
export const deleteBlockNoteEntityDirectory = async (
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
        await deleteBlockNoteEntityDirectory(subDir, entityId, createdAt, logger);
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

/**
 * Resolves relative URLs to absolute URLs in BlockNote content for display
 */
export const resolveBlockNoteUrls = (
  content: any[] | null | undefined,
  types: string[] = ["image"],
): any[] => {
  if (!content || !Array.isArray(content) || content.length === 0) return [];

  const traverse = (blocks: any[]): any[] => {
    return blocks.map((block) => {
      let newBlock = { ...block };

      if (
        types.includes(block.type) &&
        block.props?.url &&
        typeof block.props.url === "string" &&
        block.props.url.startsWith(env.server.uploadsDir)
      ) {
        // Prepend uploadsUrl (which already has baseUrl or S3_PUBLIC_URL)
        newBlock.props = {
          ...newBlock.props,
          url: `${env.server.baseUrl}${block.props.url}`.replace(/([^:]\/)\/+/g, "$1"),
        };
      }

      if (block.children && Array.isArray(block.children)) {
        newBlock.children = traverse(block.children);
      }

      return newBlock;
    });
  };

  return traverse(content);
};
