import React from "react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { DefaultReactSuggestionItem } from "@blocknote/react";
import { Info } from "lucide-react";
import { AlertBlock } from "../block/AlertBlock";
import { mathBlockSpecs, latexInlineContentSpecs } from "../block/math";

// List of all valid block types in our schema
export const VALID_BLOCK_TYPES = [
  // Default blocks
  "paragraph",
  "heading",
  "bulletListItem",
  "numberedListItem",
  "checkListItem",
  "table",
  "image",
  "video",
  "audio",
  "file",
  "codeBlock",
  // Custom blocks
  "math",
  "equation",
  "alert",
] as const;

export type ValidBlockType = (typeof VALID_BLOCK_TYPES)[number];

// Define our custom schema with math and alert blocks
// Using .extend is the standard way to add blocks to original schema
export const schema = BlockNoteSchema.create().extend({
  blockSpecs: {
    ...mathBlockSpecs,
    alert: AlertBlock(),
  },
  inlineContentSpecs: {
    ...latexInlineContentSpecs,
  },
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
