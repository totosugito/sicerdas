import React from "react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { DefaultReactSuggestionItem } from "@blocknote/react";
import { MathBlock } from "@/components/custom/components/MathBlock";

// Define our custom schema with the math block
export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    math: MathBlock(),
  },
});

// Helper to get slash menu item for the equation
export const getEquationSlashMenuItem = (editor: any): DefaultReactSuggestionItem => ({
  title: "Equation",
  onItemClick: () => {
    editor.insertBlocks(
      [{ type: "math", props: { equation: "E=mc^2" } }],
      editor.getTextCursorPosition().block,
      "after",
    );
  },
  aliases: ["math", "equation", "formula", "katex", "latex"],
  group: "Equations",
  icon: React.createElement("span", null, "∑"),
});
