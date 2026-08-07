import React, { useMemo } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "katex/dist/katex.min.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

import { schema } from "./lib/blocknote-config";
import { validateAndRepairBlockNoteContent } from "@/features/exam/questions/json-questions/utils/validate-blocknote-content";

export type BlockNoteStaticProps = {
  content: any[];
  className?: string;
  minHeight?: string;
  editable?: boolean;
};

export const BlockNoteStatic = ({
  content,
  className,
  minHeight = "auto",
  editable = false,
}: BlockNoteStaticProps) => {
  const { theme: appTheme } = useTheme();

  // Custom CSS to remove BlockNote's default large side padding in readonly mode
  const styleTag = (
    <style>
      {`
        .bn-editor {
          padding-inline: 12px !important;
        }
        .bn-block-content {
          margin-inline-start: 0 !important;
          width: 100% !important;
        }
        .ProseMirror-trailingBreak {
          display: none !important;
        }
        /* Allow KaTeX formulas to overflow naturally without clipping */
        .bn-editor,
        .bn-block-content,
        .bn-block-outer,
        .bn-block,
        .bn-equation-host,
        .bn-equation {
          overflow: visible !important;
        }
        .bn-equation {
          padding: 0.5rem 0.75rem !important;
          min-height: auto !important;
        }
        .katex-display {
          margin: 0 !important;
        }
        /* Definitively hide scrollbars in equation blocks even when they are compact/fit-content */
        .bn-editor [data-content-type="equation"] * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .bn-editor [data-content-type="equation"] *::-webkit-scrollbar {
          display: none !important;
        }
        /* Remove any borders/focus rings when clicking equation blocks in static view */
        .bn-editor [data-content-type="equation"] > div {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }
      `}
    </style>
  );

  const resolvedTheme = useMemo(() => {
    return appTheme === "system"
      ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : appTheme;
  }, [appTheme]);

  const safeContent = useMemo(() => {
    if (!content || !Array.isArray(content) || content.length === 0) return undefined;
    const cloned = JSON.parse(JSON.stringify(content));
    validateAndRepairBlockNoteContent(cloned);
    return cloned;
  }, [content]);

  const editor = useCreateBlockNote({
    schema, // Shared schema with math block support
    initialContent: safeContent,
  });

  // Update content whenever it changes without remounting the entire view
  React.useEffect(() => {
    if (editor && safeContent) {
      editor.replaceBlocks(editor.document, safeContent);
    }
  }, [editor, safeContent]);

  return (
    <div
      className={cn("border bg-card transition-all", className)}
      style={{ minHeight }}
    >
      {styleTag}
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme}
        editable={editable}
        sideMenu={false}
        slashMenu={false}
        formattingToolbar={false}
      />
    </div>
  );
};
