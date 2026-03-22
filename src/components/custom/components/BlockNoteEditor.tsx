import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTheme } from "@/lib/theme-provider";
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PassageFormValues } from "@/api/exam-passages/types";

type BlockNoteEditorProps = {
  form: UseFormReturn<PassageFormValues>;
  defaultValues?: Partial<PassageFormValues>;
  isPending?: boolean;
  onContentChange: (content: any[]) => void;
};

export function BlockNoteEditor({
  form,
  defaultValues,
  isPending,
  onContentChange,
}: BlockNoteEditorProps) {
  const { t } = useAppTranslation();
  const { theme: appTheme } = useTheme();

  const resolvedTheme =
    appTheme === "system"
      ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : appTheme;

  const editor = useCreateBlockNote({
    initialContent:
      defaultValues?.content && defaultValues.content.length > 0
        ? (defaultValues.content as any)
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
    const currentVal = form.getValues("content");
    const blocks = currentVal && currentVal.length > 0 ? currentVal : [];
    if (JSON.stringify(editor.document) !== JSON.stringify(blocks)) {
      editor.replaceBlocks(
        editor.document,
        blocks.length > 0 ? blocks : [{ type: "paragraph", content: [] }],
      );
    }
  }, [form.formState.isDirty, editor, form]);

  // Handle reset-button click from cancel
  useEffect(() => {
    if (!editor || !defaultValues) return;
    // Re-populate when defaultValues changes (edit mode)
    const originalContent =
      defaultValues.content && defaultValues.content.length > 0
        ? (defaultValues.content as any)
        : [{ type: "paragraph", content: [] }];
    editor.replaceBlocks(editor.document, originalContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const handleCancel = () => {
    form.reset();
    if (editor) {
      const originalContent =
        defaultValues?.content && defaultValues.content.length > 0
          ? (defaultValues.content as any)
          : [{ type: "paragraph", content: [] }];
      editor.replaceBlocks(editor.document, originalContent);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <FormLabel className="text-foreground font-medium">
          {t(($) => $.exam.passages.form.content.label)}
        </FormLabel>
        <div className="min-h-[300px] border rounded-md bg-background">
          <BlockNoteView editor={editor} theme={resolvedTheme} />
        </div>
        {form.formState.errors.content && (
          <p className="text-destructive text-sm font-medium">
            {form.formState.errors.content.message}
          </p>
        )}
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
