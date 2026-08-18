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
        if (options.includeMath) {
          if (block.type === "equation") {
            return block.props?.latex || "";
          }
        }

        if (block.content && Array.isArray(block.content)) {
          return block.content
            .map((item: any) => {
              if (options.includeMath && item.type === "latex") {
                return item.props?.latex || "";
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
