import { saveFile, deleteFile } from "../../platform/storage/storage.ts";
import env from "../../config/env.config.ts";
import { createUniqueFileName } from "../my-utils.ts";
import type { UploadedFile } from "../../types/file.ts";
import sharp from "sharp";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  createBlockSpec,
  defaultProps,
} from "@blocknote/core";

// Define the custom Equation block for the server
const EquationBlock = createBlockSpec(
  {
    type: "equation",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      latex: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (block) => {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("class", "bn-equation");
      wrapper.setAttribute("data-latex", block.props.latex);
      // Wrap in $$ for KaTeX auto-renderers on the frontend
      wrapper.textContent = `$$${block.props.latex}$$`;
      return {
        dom: wrapper,
      };
    },
  },
);

// Define the custom Alert block for the server
const AlertBlock = createBlockSpec(
  {
    type: "alert",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: "info",
        values: ["info", "warning", "success", "error"],
      },
    },
    content: "inline",
  },
  {
    render: (block) => {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-type", "alert");
      wrapper.setAttribute("data-alert-type", block.props.type);

      const content = document.createElement("div");
      content.setAttribute("class", "alert-content");
      wrapper.appendChild(content);

      return {
        dom: wrapper,
        contentDOM: content,
      };
    },
  },
);

// Create the schema with custom blocks
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    equation: EquationBlock(),
    alert: AlertBlock(),
  },
});

/**
 * Generates the relative URL for a BlockNote file
 */
export const getBlockNoteFileUrl = (
  subDir: string,
  yearMonth: string,
  entityId: string,
  fileName: string,
): string => {
  return `${subDir}/${yearMonth}/${entityId}/${fileName}`.replace(/\/+/g, "/");
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
 * Helper to compress and optionally resize a JPEG, PNG, or WebP image buffer.
 */
export const resizeAndCompressImage = async (
  buffer: Buffer,
  contentType: string,
  resizeWidth: number = 1024,
  quality: number = 80,
  logger?: any,
): Promise<Buffer> => {
  const resizableMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!resizableMimeTypes.includes(contentType.toLowerCase())) {
    return buffer;
  }

  try {
    let image = sharp(buffer);
    const metadata = await image.metadata();

    if (resizeWidth && metadata.width && metadata.width > resizeWidth) {
      image = image.resize({ width: resizeWidth, withoutEnlargement: true });
    }

    return await image
      .jpeg({ quality, progressive: true, force: false })
      .png({ quality, force: false })
      .webp({ quality, force: false })
      .toBuffer();
  } catch (error) {
    logger?.warn?.({ err: error }, "Failed to process/compress image");
    return buffer;
  }
};

/**
 * Processes and saves uploaded BlockNote files, returning a map of original names to final URLs
 */
export const processBlockNoteFiles = async (
  subDir: string,
  entityId: string,
  files: UploadedFile[],
  createdAt?: Date | string,
  resizeWidth: number = 1024,
  quality: number = 80,
): Promise<Record<string, string>> => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const urlMap: Record<string, string> = {};

  for (const file of files) {
    const contentType = file.mimetype.toLowerCase();
    const buffer = await resizeAndCompressImage(file.buffer, contentType, resizeWidth, quality);

    const fileName = createUniqueFileName(file.filename, "blocknote_file");
    const relativePath = getBlockNoteFileUrl(subDir, yearMonth, entityId, fileName);

    await saveFile(relativePath, buffer, file.mimetype);

    urlMap[file.filename] = relativePath;
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

  const downloadsMark = env.server.uploadsDir;

  const getRelativePath = (url: string) => {
    // Since images are now stored as subDir/year-month/entityId/filename.ext
    // Any URL NOT starting with http or blob: is likely our relative path
    if (url.startsWith("http") || url.startsWith("blob:")) {
      return null;
    }
    // If for some reason it still has the uploadsDir prefix (legacy), strip it
    if (url.startsWith(downloadsMark)) {
      return url.substring(downloadsMark.length).replace(/^\/+/, "");
    }
    return url;
  };

  const oldPaths = oldUrls.map(getRelativePath).filter((p): p is string => p !== null);
  const newPaths = newUrls.map(getRelativePath).filter((p): p is string => p !== null);

  const deletedPaths = oldPaths.filter((path) => !newPaths.includes(path));

  for (const relativePath of deletedPaths) {
    await deleteFile(relativePath, logger);
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
        !block.props.url.startsWith("http") &&
        !block.props.url.startsWith("blob:")
      ) {
        // Prepend baseUrl and uploadsDir
        newBlock.props = {
          ...newBlock.props,
          url: `${env.server.baseUrl}/${env.server.uploadsDir}/${block.props.url}`.replace(
            /([^:]\/)\/+/g,
            "$1",
          ),
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
 * Strips public URLs back to relative paths in BlockNote content for storage
 */
export const stripBlockNoteUrls = (
  content: any[] | null | undefined,
  types: string[] = ["image"],
): any[] => {
  if (!content || !Array.isArray(content) || content.length === 0) return [];

  const downloadsMark = env.server.uploadsDir;
  const baseUrl = env.server.baseUrl;

  const traverse = (blocks: any[]): any[] => {
    return blocks.map((block) => {
      let newBlock = { ...block };

      if (
        types.includes(block.type) &&
        block.props?.url &&
        typeof block.props.url === "string" &&
        !block.props.url.startsWith("blob:")
      ) {
        let url = block.props.url;

        // 1. Strip baseUrl if present
        if (baseUrl && url.startsWith(baseUrl)) {
          url = url.substring(baseUrl.length);
        }

        // 2. Strip uploadsDir if present (handle both /uploads/ and uploads/)
        const normalizedMark = downloadsMark.replace(/^\/+/, "").replace(/\/+$/, "");
        const urlWithoutLeadingSlash = url.replace(/^\/+/, "");

        if (urlWithoutLeadingSlash.startsWith(normalizedMark)) {
          url = urlWithoutLeadingSlash.substring(normalizedMark.length);
        }

        // Ensure no leading slash in the final relative path
        url = url.replace(/^\/+/, "");

        newBlock.props = {
          ...newBlock.props,
          url: url,
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
 * Downloads external images referenced in BlockNote content and saves them locally,
 * updating the block URL to the relative local storage path.
 */
export const processExternalImages = async (
  subDir: string,
  entityId: string,
  content: any[],
  createdAt?: Date | string,
  types: string[] = ["image"],
  logger?: any,
  resizeWidth: number = 1024,
  quality: number = 80,
): Promise<any[]> => {
  if (!content || !Array.isArray(content) || content.length === 0) return [];

  const date = createdAt ? new Date(createdAt) : new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const baseUrl = env.server.baseUrl;

  const traverse = async (blocks: any[]): Promise<any[]> => {
    const updatedBlocks = [];

    for (const block of blocks) {
      let newBlock = { ...block };

      if (
        types.includes(block.type) &&
        block.props?.url &&
        typeof block.props.url === "string"
      ) {
        const url = block.props.url;

        // Check if URL is an external HTTP/HTTPS link not hosted on our server
        const isExternal =
          (url.startsWith("http://") || url.startsWith("https://")) &&
          (!baseUrl || !url.startsWith(baseUrl));

        if (isExternal) {
          try {
            const response = await fetch(url, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
            });

            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const contentType = response.headers.get("content-type") || "image/jpeg";
              let ext = "png";
              if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
              else if (contentType.includes("webp")) ext = "webp";
              else if (contentType.includes("gif")) ext = "gif";
              else if (contentType.includes("png")) ext = "png";
              else if (contentType.includes("svg")) ext = "svg";
              else {
                const urlExt = url.split("?")[0].split(".").pop();
                if (urlExt && urlExt.length <= 4) ext = urlExt;
              }

              const buffer = await resizeAndCompressImage(
                Buffer.from(arrayBuffer),
                contentType,
                resizeWidth,
                quality,
                logger,
              );

              let originalName = "external_image";
              try {
                const urlObj = new URL(url);
                const pathname = urlObj.pathname;
                const baseName = pathname.substring(pathname.lastIndexOf("/") + 1);
                const nameWithoutExt = baseName.includes(".") ? baseName.substring(0, baseName.lastIndexOf(".")) : baseName;
                if (nameWithoutExt) {
                  originalName = decodeURIComponent(nameWithoutExt);
                }
              } catch (e) {
                // Keep "external_image"
              }

              const fileName = createUniqueFileName(`${originalName}.${ext}`, "blocknote_file");
              const relativePath = getBlockNoteFileUrl(subDir, yearMonth, entityId, fileName);

              await saveFile(relativePath, buffer, contentType);

              newBlock.props = {
                ...newBlock.props,
                url: relativePath,
              };
            }
          } catch (error) {
            logger?.warn?.({ err: error, url }, "Failed to download external image for BlockNote block");
          }
        }
      }

      if (block.children && Array.isArray(block.children)) {
        newBlock.children = await traverse(block.children);
      }

      updatedBlocks.push(newBlock);
    }

    return updatedBlocks;
  };

  return traverse(content);
};

/**
 * Utility to convert BlockNote JSON structure to HTML string using @blocknote/core.
 */
export const blocknoteToHtml = async (content: any[] | null | undefined): Promise<string> => {
  if (!content || !Array.isArray(content) || content.length === 0) return "";

  try {
    const editor = ServerBlockNoteEditor.create({ schema });
    return await editor.blocksToHTMLLossy(content);
  } catch (error) {
    console.error("Error converting blocknote to html", error);
    return "";
  }
};
