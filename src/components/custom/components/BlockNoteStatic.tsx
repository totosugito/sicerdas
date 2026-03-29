import React, { useMemo } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

export type BlockNoteStaticProps = {
  content: any[];
  className?: string;
  minHeight?: string;
};

export const BlockNoteStatic = ({
  content,
  className,
  minHeight = "auto",
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
        }
        .ProseMirror-trailingBreak {
          display: none !important;
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
        editable={false}
        sideMenu={false}
        slashMenu={false}
      />
    </div>
  );
};
