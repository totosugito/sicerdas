import { BlockNoteEditor } from "@blocknote/core";
import { APP_CONFIG } from "@/constants/config";

/**
 * Utility to extract plain text from BlockNote JSON structure.
 * It uses a headless editor instance to ensure accurate extraction.
 */
export function blocknote_to_text(
  content: any[] | null | undefined,
  options: { includeMath?: boolean } = { includeMath: false },
): string {
  if (!content || !Array.isArray(content) || content.length === 0) return "";

  try {
    return content
      .map((block: any) => {
        if (options.includeMath && block.type === "math") {
          return block.props?.equation || "";
        }

        if (block.content && Array.isArray(block.content)) {
          return block.content.map((item: any) => item.text || "").join("");
        }
        return "";
      })
      .join(" ")
      .trim();
  } catch (e) {
    return "";
  }
}

/**
 * Utility to convert BlockNote JSON structure to HTML string.
 */
export async function blocknote_to_html(content: any[] | null | undefined): Promise<string> {
  if (!content || !Array.isArray(content) || content.length === 0) return "";

  try {
    const editor = BlockNoteEditor.create({ initialContent: content });
    // In 0.47.1, blocksToFullHTML is used for the internal structure.
    return editor.blocksToHTMLLossy(content);
  } catch (e) {
    console.error("Error converting blocknote to html", e);
    return "";
  }
}

/**
 * Utility to prepare BlockNote content for submission by replacing blob URLs with placeholders
 */
export function prepare_blocknote_submission(
  content: any[] | null | undefined,
  pendingFiles: Map<string, File>,
  options: {
    types?: string[];
    prefix?: string;
  } = {},
): {
  submissionContent: any[];
  filesToUpload: { placeholder: string; file: File }[];
} {
  const { types = ["image"], prefix = "upload" } = options;

  if (!content || !Array.isArray(content) || content.length === 0) {
    return { submissionContent: [], filesToUpload: [] };
  }

  const filesToUpload: { placeholder: string; file: File }[] = [];
  const blobToPlaceholderMap: Map<string, string> = new Map();
  let placeholderCount = 0;

  const traverse = (blocks: any[]): any[] => {
    return blocks.map((block) => {
      let newBlock = { ...block };

      if (types.includes(block.type) && block.props?.url && typeof block.props.url === "string") {
        const url = block.props.url;

        if (url.startsWith("blob:")) {
          let placeholder = blobToPlaceholderMap.get(url);

          if (!placeholder) {
            const file = pendingFiles.get(url);
            if (file) {
              // Get original extension
              const originalExt = file.name.split(".").pop() || "png";
              placeholder = `${prefix}_${placeholderCount++}.${originalExt}`;
              blobToPlaceholderMap.set(url, placeholder);
              filesToUpload.push({ placeholder, file });
            }
          }

          if (placeholder) {
            newBlock.props = { ...newBlock.props, url: placeholder };
          }
        } else if (url.includes(APP_CONFIG.app.uploadDirs)) {
          // If it's already a server URL, we should store only the relative part
          const uploadsIndex = url.indexOf(APP_CONFIG.app.uploadDirs);
          if (uploadsIndex !== -1) {
            newBlock.props = {
              ...newBlock.props,
              url: url.substring(uploadsIndex),
            };
          }
        }
      }

      if (block.children && Array.isArray(block.children)) {
        newBlock.children = traverse(block.children);
      }

      return newBlock;
    });
  };

  const submissionContent = traverse(content);

  return { submissionContent, filesToUpload };
}
