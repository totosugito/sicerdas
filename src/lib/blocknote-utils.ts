/**
 * Utility to extract plain text from BlockNote JSON structure.
 * It iterates through blocks and their internal content to concatenate text.
 */
export function blocknote_to_text(content: any[] | null | undefined): string {
    if (!content || !Array.isArray(content)) return "";

    return content
        .map((block: any) => {
            if (block.content && Array.isArray(block.content)) {
                return block.content
                    .map((item: any) => item.text || "")
                    .join("");
            }
            return "";
        })
        .join(" ")
        .trim();
}
