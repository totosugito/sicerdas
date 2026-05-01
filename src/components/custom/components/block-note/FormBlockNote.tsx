import React, { useEffect, useMemo, useRef } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  DefaultReactSuggestionItem,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

export type FormBlockNoteProps = {
  form: UseFormReturn<any>;
  item: {
    name: string;
    label: string;
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

import { schema, getEquationSlashMenuItem, getAlertSlashMenuItem } from "./lib/blocknote-config";
import "@/assets/custom-blocknote.css";

export const FormBlockNote = ({
  form,
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

  // Use a ref to store the initial value for the editor to avoid recreations
  const initialValueRef = useRef(form.getValues(item.name));

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

  const editor = useCreateBlockNote({
    schema,
    initialContent:
      initialValueRef.current && initialValueRef.current.length > 0
        ? initialValueRef.current
        : undefined,
    uploadFile: item.uploadFile,
  });

  // Sync editor content to form state on change
  useEffect(() => {
    if (!editor) return;

    const unbind = editor.onChange(() => {
      form.setValue(item.name, editor.document, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    });

    return () => unbind();
  }, [editor, form, item.name]);

  // Handle external reset (when form value changes but editor is different)
  const formValue = form.watch(item.name);

  useEffect(() => {
    if (!editor) return;

    // If the form is NOT dirty, it might have been reset
    if (!form.formState.isDirty) {
      const blocks = formValue && formValue.length > 0 ? formValue : [];

      // We only want to replace if they are actually different to avoid cursor jumps
      if (JSON.stringify(editor.document) !== JSON.stringify(blocks)) {
        editor.replaceBlocks(
          editor.document,
          blocks.length > 0 ? blocks : [{ type: "paragraph", content: [] }],
        );
      }
    }
  }, [form.formState.isDirty, editor, formValue]);

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

    <FormField
      control={form.control}
      name={item.name}
      render={({ field }) => (
        <FormItem className="flex flex-col flex-1">
          <FormLabel className={cn("", labelClassName)}>
            {item.label}
            {item.required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <div
              className={cn(
                "border rounded-md bg-background flex-1 overflow-y-auto transition-all",
                disabled && "opacity-60 bg-muted cursor-not-allowed",
                className,
              )}
              style={{ minHeight: item.minHeight || "400px" }}
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
                      getEquationSlashMenuItem(editor),
                      getAlertSlashMenuItem(editor),
                    ];
                    return filterSuggestionItems(allItems, query);
                  }}
                />
                {styleTag}
              </BlockNoteView>
            </div>
          </FormControl>
          {item.description && <FormDescription>{item.description}</FormDescription>}
          {showMessage && <FormMessage />}
        </FormItem>
      )}
    />
  );
};
