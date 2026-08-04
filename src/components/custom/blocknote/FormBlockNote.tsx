import React, { useEffect, useMemo, useRef } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
  DefaultReactSuggestionItem,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

export type FormBlockNoteProps = {
  field?: any; // The field instance from TanStack form.AppField render prop
  initialContent?: any[];
  onChange?: (content: any[]) => void;
  uploadFile?: (file: File) => Promise<string>;
  item?: {
    label?: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    minHeight?: string;
    uploadFile?: (file: File) => Promise<string>;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
};

import { schema, getAlertSlashMenuItem } from "./lib/blocknote-config";
import { getMathSlashMenuItems } from "./block/math";
import "@/assets/custom-blocknote.css";

export const FormBlockNote = ({
  field,
  initialContent,
  onChange,
  uploadFile,
  item,
  labelClassName = "text-foreground font-medium",
  showMessage = true,
  className,
  disabled = false,
  ...props
}: FormBlockNoteProps) => {
  const { theme: appTheme } = useTheme();

  const resolvedTheme = useMemo(() => {
    return appTheme === "system"
      ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : appTheme;
  }, [appTheme]);

  const initialContentData = field ? field.state.value : initialContent;

  // Use a ref to store the initial value for the editor to avoid recreations
  const initialValueRef = useRef(initialContentData);

  const styleTag = (
    <style>
      {`
        .bn-editor {
          padding-inline: 54px 10px !important;
        }
        .bn-block-content {
          margin-inline-start: 0 !important;
        }
      `}
    </style>
  );

  const defaultUploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const effectiveUploadFile = item?.uploadFile || uploadFile || defaultUploadFile;

  const editor = useCreateBlockNote({
    schema,
    initialContent:
      initialValueRef.current && initialValueRef.current.length > 0
        ? initialValueRef.current
        : undefined,
    uploadFile: effectiveUploadFile,
  });

  // Sync editor content to form state / onChange on change
  useEffect(() => {
    if (!editor) return;

    const unbind = editor.onChange(() => {
      if (field) {
        field.handleChange(editor.document);
      }
      if (onChange) {
        onChange(editor.document);
      }
    });

    return () => unbind();
  }, [editor, field, onChange]);

  // Handle external reset (when form value changes but editor is different)
  const fieldValue = field ? field.state.value : initialContent;

  useEffect(() => {
    if (!editor) return;

    const blocks = fieldValue && fieldValue.length > 0 ? fieldValue : [];

    // We only want to replace if they are actually different to avoid cursor jumps
    if (JSON.stringify(editor.document) !== JSON.stringify(blocks)) {
      editor.replaceBlocks(
        editor.document,
        blocks.length > 0 ? blocks : [{ type: "paragraph", content: [] }],
      );
    }
  }, [editor, fieldValue]);

  // Handle disabled state
  useEffect(() => {
    if (!editor) return;
    editor.isEditable = !disabled;
  }, [editor, disabled]);

  // Fix for mouse scroll not working in BlockNote menus when inside a Radix Dialog.
  // This is because Radix UI's scroll lock intercepts wheel events on the body/window.
  // We use a MutationObserver to attach an onWheel handler that stops propagation 
  // to every BlockNote menu as it's added to the DOM (since they are portalled).
  useEffect(() => {
    if (typeof document === "undefined") return;

    const attachWheelStop = (el: HTMLElement) => {
      el.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Target the suggestion menu and other portalled menus
            const menus = node.matches(".bn-suggestion-menu, .bn-side-menu, .bn-formatting-toolbar, .bn-drag-handle-menu")
              ? [node]
              : Array.from(node.querySelectorAll(".bn-suggestion-menu, .bn-side-menu, .bn-formatting-toolbar, .bn-drag-handle-menu"));

            menus.forEach((m) => attachWheelStop(m as HTMLElement));
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also try to find already existing menus
    document.querySelectorAll(".bn-suggestion-menu, .bn-side-menu, .bn-formatting-toolbar, .bn-drag-handle-menu")
      .forEach((m) => attachWheelStop(m as HTMLElement));

    return () => observer.disconnect();
  }, []);

  return (
    <div data-slot="form-item" className="flex flex-col flex-1 gap-2">
      {item?.label && field?.Label && (
        <field.Label className={cn("", labelClassName)}>
          {item.label}
          {item.required && <span className="text-red-500">*</span>}
        </field.Label>
      )}
      <div
        className={cn(
          "border rounded-md bg-background flex-1 overflow-y-auto transition-all",
          disabled && "opacity-60 bg-muted cursor-not-allowed",
          className,
        )}
        style={{ minHeight: item?.minHeight || "400px" }}
        onClick={(e) => {
          // Prevent any buttons inside BlockNote (like the '+' add item button) from triggering a form submit
          const target = e.target as HTMLElement;
          const button = target.closest("button");
          if (button && button.type === "submit") {
            e.preventDefault();
          }
        }}
      >
        <BlockNoteView
          editor={editor}
          theme={resolvedTheme}
          editable={!disabled}
          slashMenu={false}
        >
          <SuggestionMenuController
            triggerCharacter={"/"}
            getItems={async (query) => {
              const allItems: DefaultReactSuggestionItem[] = [
                ...getDefaultReactSlashMenuItems(editor),
                ...getMathSlashMenuItems(editor),
                getAlertSlashMenuItem(editor),
              ];
              return filterSuggestionItems(allItems, query);
            }}
          />
          {styleTag}
        </BlockNoteView>
      </div>
      {item?.description && field?.Description && (
        <field.Description>{item.description}</field.Description>
      )}
      {showMessage && field?.Message && <field.Message />}
    </div>
  );
};
