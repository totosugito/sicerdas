import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useEffect } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { useTheme } from "@/lib/theme-provider";
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";

export type BlockNoteEditorProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  fieldName: Path<T>;
  label?: string;
  defaultValues?: Partial<T>;
  isPending?: boolean;
  onContentChange: (content: any[]) => void;
};

export function BlockNoteEditor<T extends FieldValues>({
  form,
  fieldName,
  label,
  defaultValues,
  isPending,
  onContentChange,
}: BlockNoteEditorProps<T>) {
  const { t } = useAppTranslation();
  const { theme: appTheme } = useTheme();

  const resolvedTheme =
    appTheme === "system"
      ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : appTheme;

  const initialContent = defaultValues?.[fieldName as string];

  const editor = useCreateBlockNote({
    initialContent:
      initialContent && Array.isArray(initialContent) && initialContent.length > 0
        ? (initialContent as any)
        : undefined,
  });

  // Sync editor → form
  useEffect(() => {
    if (!editor) return;
    const unbind = editor.onChange(() => {
      onContentChange(editor.document);
    });
    return () => unbind();
  }, [editor, onContentChange]);

  // Handle external reset (form reset clears isDirty)
  useEffect(() => {
    if (!editor || form.formState.isDirty) return;
    const currentVal = form.getValues(fieldName);
    const blocks =
      currentVal && Array.isArray(currentVal) && currentVal.length > 0 ? currentVal : [];
    if (JSON.stringify(editor.document) !== JSON.stringify(blocks)) {
      editor.replaceBlocks(
        editor.document,
        blocks.length > 0 ? blocks : [{ type: "paragraph", content: [] }],
      );
    }
  }, [form.formState.isDirty, editor, form, fieldName]);

  // Handle external change of defaultValues
  useEffect(() => {
    if (!editor || !defaultValues) return;
    const originalValue = defaultValues[fieldName as string];
    const originalContent =
      originalValue && Array.isArray(originalValue) && originalValue.length > 0
        ? (originalValue as any)
        : [{ type: "paragraph", content: [] }];

    // Only replace if genuinely different to avoid cursor jumps
    if (JSON.stringify(editor.document) !== JSON.stringify(originalContent)) {
      editor.replaceBlocks(editor.document, originalContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const handleCancel = () => {
    form.reset();
    if (editor) {
      const originalValue = defaultValues?.[fieldName as string];
      const originalContent =
        originalValue && Array.isArray(originalValue) && originalValue.length > 0
          ? (originalValue as any)
          : [{ type: "paragraph", content: [] }];
      editor.replaceBlocks(editor.document, originalContent);
    }
  };

  const error = form.formState.errors[fieldName];

  return (
    <>
      <div className="space-y-2">
        {label && <FormLabel className="text-foreground font-medium">{label}</FormLabel>}
        <div className="min-h-[300px] border rounded-md bg-background">
          <BlockNoteView editor={editor} theme={resolvedTheme} />
        </div>
        {error && <p className="text-destructive text-sm font-medium">{error.message as string}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={handleCancel}>
          {t(($) => $.labels.cancel)}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? t(($) => $.labels.saving) : t(($) => $.labels.save)}
        </Button>
      </div>
    </>
  );
}
