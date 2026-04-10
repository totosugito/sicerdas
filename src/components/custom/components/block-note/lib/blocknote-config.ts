import React from "react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { DefaultReactSuggestionItem } from "@blocknote/react";
import { Info } from "lucide-react";
import { MathBlock } from "../block/MathBlock";
import { AlertBlock } from "../block/AlertBlock";

// Define our custom schema with math and alert blocks
// Using .extend is the standard way to add blocks to original schema
export const schema = BlockNoteSchema.create().extend({
  blockSpecs: {
    math: MathBlock(),
    alert: AlertBlock(),
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
  group: "Custom",
  icon: React.createElement("span", null, "∑"),
  subtext: "Insert a mathematical formula using KaTeX",
});

// Helper to get slash menu item for alerts
export const getAlertSlashMenuItem = (editor: any): DefaultReactSuggestionItem => ({
  title: "Alert",
  onItemClick: () => {
    editor.insertBlocks(
      [{ type: "alert", props: { type: "info" } }],
      editor.getTextCursorPosition().block,
      "after",
    );
  },
  aliases: ["alert", "info", "warning", "success", "error", "notice", "callout"],
  group: "Custom",
  icon: React.createElement(
    "span",
    { style: { fontWeight: "bold", fontSize: "18px", fontStyle: "italic", fontFamily: "serif" } },
    "i",
  ),
  subtext: "Insert a colorful callout box",
});
