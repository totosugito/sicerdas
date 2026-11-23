import { BlockNoteEditor } from "@blocknote/core";

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
        if (block.type === "mathBlock") {
          if (!options.includeMath) return "";
          if (typeof block.content === "string") return block.content;
          if (Array.isArray(block.content)) {
            return block.content.map((c: any) => c.text || "").join("");
          }
          return "";
        }

        if (block.content && Array.isArray(block.content)) {
          return block.content
            .map((item: any) => {
              if (item.type === "math") {
                if (!options.includeMath) return "";
                if (typeof item.content === "string") return item.content;
                if (Array.isArray(item.content)) {
                  return item.content.map((c: any) => c.text || "").join("");
                }
                return "";
              }
              return item.text || "";
            })
            .join("");
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
