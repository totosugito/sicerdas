import { saveFile, deleteFile } from "../platform/storage/storage.ts";
import env from "../config/env.config.ts";
import { createUniqueFileName } from "./my-utils.ts";
import type { UploadedFile } from "../types/file.ts";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  createBlockSpec,
  defaultProps,
} from "@blocknote/core";

// Define the custom Math block for the server
const MathBlock = createBlockSpec(
  {
    type: "math",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      equation: {
        default: "",
      },
      fontSize: {
        default: 18,
      },
    },
    content: "none",
  },
  {
    render: (block) => {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-type", "math");
      wrapper.setAttribute("class", "math-block");
      wrapper.setAttribute("data-equation", block.props.equation);
      wrapper.setAttribute("data-font-size", block.props.fontSize.toString());
      wrapper.style.textAlign = block.props.textAlignment;
      wrapper.style.fontSize = `${block.props.fontSize}px`;
      // Wrap in $$ for KaTeX auto-renderers on the frontend
      wrapper.textContent = `$$${block.props.equation}$$`;
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
    math: MathBlock(),
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

  for (const file of files) {
    const fileName = createUniqueFileName(file.filename, "blocknote_file");
    const relativePath = getBlockNoteFileUrl(subDir, yearMonth, entityId, fileName);

    await saveFile(relativePath, file.buffer, file.mimetype);

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
