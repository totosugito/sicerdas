import { VALID_BLOCK_TYPES } from "@/components/custom/blocknote/lib/blocknote-config";

const INLINE_CONTENT_BLOCK_TYPES = [
  "paragraph",
  "heading",
  "bulletListItem",
  "numberedListItem",
  "checkListItem",
  "alert",
];

const extractInlineContent = (node: any): any[] => {
  if (!node) return [];
  if (typeof node === "string") {
    return [{ type: "text", text: node, styles: {} }];
  }
  if (Array.isArray(node)) {
    return node.flatMap(extractInlineContent);
  }
  if (typeof node === "object") {
    if (node.type === "text") {
      return [
        {
          type: "text",
          text: node.text ?? "",
          styles: node.styles || {},
        },
      ];
    }
    if (node.type === "latex") {
      return [
        {
          type: "latex",
          props: node.props || { latex: "", displayMode: false },
        },
      ];
    }
    if (typeof node.text === "string") {
      return [
        {
          type: "text",
          text: node.text,
          styles: node.styles || {},
        },
      ];
    }
    if (node.content) {
      return extractInlineContent(node.content);
    }
    if (node.children) {
      return extractInlineContent(node.children);
    }
  }
  return [];
};

/**
 * Recursively validates that all blocks in a BlockNote content array have valid types.
 * Also repairs missing required props and malformed inline content to prevent BlockNote from crashing.
 */
export const validateAndRepairBlockNoteContent = (
  blocks: any[],
): { isValid: boolean; errorPath?: string } => {
  if (!Array.isArray(blocks)) return { isValid: true };

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];

    // Repair raw string as paragraph block
    if (typeof block === "string") {
      block = {
        type: "paragraph",
        props: {},
        content: [{ type: "text", text: block, styles: {} }],
        children: [],
      };
      blocks[i] = block;
    }

    if (typeof block !== "object" || block === null) continue;

    // Automatically repair common AI error: raw inline "text" object used as a block
    if (block.type === "text") {
      block = {
        type: "paragraph",
        props: {},
        content: [
          {
            type: "text",
            text: block.text ?? "",
            styles: block.styles || {},
          },
        ],
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

    if (block.type === "math" || block.type === "equation") {
      if (!block.props.textAlignment) block.props.textAlignment = "left";
      if (!block.props.textColor) block.props.textColor = "default";
      if (block.props.fontSize === undefined) block.props.fontSize = 18;
    } else if (block.type === "alert") {
      if (!block.props.type) block.props.type = "info";
    }

    // Repair content for inline content blocks (like alert, paragraph, heading, list items)
    if (INLINE_CONTENT_BLOCK_TYPES.includes(block.type)) {
      if (!block.content) {
        if (block.children && Array.isArray(block.children) && block.children.length > 0) {
          block.content = extractInlineContent(block.children);
          block.children = [];
        } else {
          block.content = [];
        }
      } else if (typeof block.content === "string") {
        block.content = [{ type: "text", text: block.content, styles: {} }];
      } else if (Array.isArray(block.content)) {
        const hasBlockNodes = block.content.some(
          (item: any) =>
            typeof item === "string" ||
            (typeof item === "object" &&
              item !== null &&
              item.type !== "text" &&
              item.type !== "latex" &&
              (item.content || item.children || VALID_BLOCK_TYPES.includes(item.type))),
        );

        if (hasBlockNodes) {
          block.content = extractInlineContent(block.content);
        } else {
          block.content = block.content.map((item: any) => {
            if (typeof item === "string") {
              return { type: "text", text: item, styles: {} };
            }
            if (typeof item === "object" && item !== null) {
              if (!item.type && typeof item.text === "string") {
                return { type: "text", text: item.text, styles: item.styles || {} };
              }
            }
            return item;
          });
        }
      }
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

