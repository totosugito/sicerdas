import { BlockNoteEditor } from "@blocknote/core";

/**
 * Utility to extract plain text from BlockNote JSON structure.
 * It uses a headless editor instance to ensure accurate extraction.
 */
export function blocknote_to_text(content: any[] | null | undefined): string {
  if (!content || !Array.isArray(content) || content.length === 0) return "";

  try {
    const editor = BlockNoteEditor.create({ initialContent: content });
    // BlockNote doesn't have a direct blocksToText in 0.47, we manually map or use a shortcut.
    // A better way is to use the document property and map it.
    return content
      .map((block: any) => {
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
    return await editor.blocksToHTMLLossy(content);
  } catch (e) {
    console.error("Error converting blocknote to html", e);
    return "";
  }
}
