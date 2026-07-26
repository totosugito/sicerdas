import React, { useMemo } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

import { schema } from "./lib/blocknote-config";
import "@/assets/custom-blocknote.css";

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
        /* KaTeX specific fixes for BlockNote */
        .katex-display {
          margin: 0 !important;
          overflow-x: visible !important;
          overflow-y: hidden !important;
        }
        /* Definitively hide scrollbars in math blocks even when they are compact/fit-content */
        .bn-editor [data-content-type="math"] * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .bn-editor [data-content-type="math"] *::-webkit-scrollbar {
          display: none !important;
        }
        /* Remove any borders/focus rings when clicking math blocks in static view */
        .bn-editor [data-content-type="math"] > div {
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

  const editor = useCreateBlockNote({
    schema, // Shared schema with math block support
    initialContent: content && content.length > 0 ? content : undefined,
  });

  // Update content whenever it changes without remounting the entire view
  React.useEffect(() => {
    if (editor && content) {
      editor.replaceBlocks(editor.document, content);
    }
  }, [editor, content]);

  return (
    <div
      className={cn("border bg-card overflow-hidden transition-all", className)}
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
