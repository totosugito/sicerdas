import { join } from "node:path";
import { writeFile, unlink } from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import env from "../config/env.config.ts";
import { createUniqueFileName } from "./my-utils.ts";
import type { UploadedFile } from "../types/file.ts";

/**
 * Generates the relative URL for a question file
 */
export const getQuestionFileUrl = (
  yearMonth: string,
  questionId: string,
  fileName: string,
): string => {
  return `/uploads/${env.server.uploadsQuestionDir}/${yearMonth}/${questionId}/${fileName}`.replace(
    /\/+/g,
    "/",
  );
};

/**
 * Extracts all unique URLs from BlockNote content
 */
export const extractQuestionUrls = (content: any[]): string[] => {
  const urls: string[] = [];

  const traverse = (blocks: any[]) => {
    for (const block of blocks) {
      if (
        ["image", "file", "video", "audio"].includes(block.type) &&
        block.props?.url &&
        typeof block.props.url === "string"
      ) {
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
export const replaceQuestionUrls = (content: any[], urlMap: Record<string, string>): any[] => {
  const traverse = (blocks: any[]): any[] => {
    return blocks.map((block) => {
      let newBlock = { ...block };

      if (
        ["image", "file", "video", "audio"].includes(block.type) &&
        block.props?.url &&
        urlMap[block.props.url]
      ) {
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
 * Processes and saves uploaded question files, returning a map of original names to final URLs
 */
export const processQuestionFiles = async (
  questionId: string,
  files: UploadedFile[],
): Promise<Record<string, string>> => {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const uploadDir = join(
    process.cwd(),
    env.server.uploadsDir,
    env.server.uploadsQuestionDir,
    yearMonth,
    questionId,
  );

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const urlMap: Record<string, string> = {};

  for (const file of files) {
    const fileName = createUniqueFileName(file.filename, "question_file");
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, file.buffer);

    // Save mapping using the original filename as the key
    // This assumes the frontend sends the original filename (or blob URL name)
    urlMap[file.filename] = getQuestionFileUrl(yearMonth, questionId, fileName);
  }

  return urlMap;
};

/**
 * Deletes files that are no longer referenced in the question content
 */
export const cleanupQuestionFiles = async (oldContent: any[], newContent: any[]): Promise<void> => {
  const oldUrls = extractQuestionUrls(oldContent);
  const newUrls = extractQuestionUrls(newContent);

  const uploadsMark = "/uploads/";

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

  console.log(`[Cleanup] Scanning for orphaned files...`);
  console.log(
    `[Cleanup] Found ${oldPaths.length} old files and ${newPaths.length} new files in content.`,
  );

  if (deletedPaths.length > 0) {
    console.log(`[Cleanup] Identified ${deletedPaths.length} files to be removed:`, deletedPaths);
  } else {
    console.log(`[Cleanup] No files identified for deletion.`);
  }

  for (const relativePath of deletedPaths) {
    const filePath = join(process.cwd(), env.server.uploadsDir, relativePath);

    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
        console.log(`[Cleanup] Successfully deleted: ${filePath}`);
      } catch (error) {
        console.error(`[Cleanup] Error deleting file ${filePath}:`, error);
      }
    } else {
      console.warn(`[Cleanup] File not found on disk, skipping: ${filePath}`);
    }
  }
};
