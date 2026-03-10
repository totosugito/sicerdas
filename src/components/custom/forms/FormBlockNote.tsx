import React, { useEffect, useMemo, useRef } from 'react';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useTheme } from '@/lib/theme-provider';

export type FormBlockNoteProps = {
    form: UseFormReturn<any>;
    item: {
        name: string;
        label: string;
        placeholder?: string;
        description?: string;
        required?: boolean;
        minHeight?: string;
    };
    disabled?: boolean;
    className?: string;
    labelClassName?: string;
    showMessage?: boolean;
};

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
            ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            : appTheme;
    }, [appTheme]);

    // Use a ref to store the initial value for the editor to avoid recreations
    const initialValueRef = useRef(form.getValues(item.name));

    const editor = useCreateBlockNote({
        initialContent: initialValueRef.current && initialValueRef.current.length > 0
            ? initialValueRef.current
            : undefined,
    });

    // Sync editor content to form state on change
    useEffect(() => {
        if (!editor) return;

        const unbind = editor.onChange(() => {
            form.setValue(item.name, editor.document, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true
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
            const currentVal = form.getValues(item.name);
            const blocks = currentVal && currentVal.length > 0 ? currentVal : [];

            // We only want to replace if they are actually different to avoid cursor jumps
            if (JSON.stringify(editor.document) !== JSON.stringify(blocks)) {
                editor.replaceBlocks(editor.document, blocks.length > 0 ? blocks : [{ type: "paragraph", content: [] }]);
            }
        }
    }, [form.formState.isDirty, editor, item.name, form]);

    // Handle disabled state
    useEffect(() => {
        if (!editor) return;
        editor.isEditable = !disabled;
    }, [editor, disabled]);

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
                                "border rounded-md bg-background flex-1 overflow-hidden transition-all",
                                disabled && "opacity-60 bg-muted cursor-not-allowed",
                                className
                            )}
                            style={{ minHeight: item.minHeight || "400px" }}
                        >
                            <BlockNoteView editor={editor} theme={resolvedTheme} editable={!disabled} />
                        </div>
                    </FormControl>
                    {item.description && <FormDescription>{item.description}</FormDescription>}
                    {showMessage && <FormMessage />}
                </FormItem>
            )}
        />
    );
};
