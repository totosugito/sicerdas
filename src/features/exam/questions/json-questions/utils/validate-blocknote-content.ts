import { VALID_BLOCK_TYPES } from "@/components/custom/blocknote/lib/blocknote-config";

/**
 * Recursively validates that all blocks in a BlockNote content array have valid types.
 * Also repairs missing required props to prevent BlockNote from crashing.
 */
export const validateAndRepairBlockNoteContent = (
  blocks: any[],
): { isValid: boolean; errorPath?: string } => {
  if (!Array.isArray(blocks)) return { isValid: true };

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    if (typeof block !== "object" || block === null) continue;

    // Automatically repair common AI error: raw inline "text" object used as a block
    if (block.type === "text") {
      block = {
        type: "paragraph",
        props: {},
        content: [block],
        children: [],
      };
      blocks[i] = block;
    }

    // Check the block type
    if (block.type && !VALID_BLOCK_TYPES.includes(block.type as any)) {
      return { isValid: false, errorPath: `type: "${block.type}"` };
    }

    // Automatically repair missing properties to prevent BlockNote crashes
    if (!block.props) block.props = {};

    if (block.type === "math") {
      if (!block.props.textAlignment) block.props.textAlignment = "left";
      if (!block.props.textColor) block.props.textColor = "default";
      if (block.props.fontSize === undefined) block.props.fontSize = 18;
    } else if (block.type === "alert") {
      if (!block.props.type) block.props.type = "info";
    }

    // Recursively check children
    if (block.children && Array.isArray(block.children)) {
      const result = validateAndRepairBlockNoteContent(block.children);
      if (!result.isValid) {
        return {
          isValid: false,
          errorPath: `${block.type} > ${result.errorPath}`,
        };
      }
    }
  }

  return { isValid: true };
};
