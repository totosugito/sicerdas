import React, { useEffect } from 'react';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useAppTranslation } from '@/lib/i18n-typed';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ControlForm } from '@/components/custom/forms';
import { FormWithDetector } from '@/components/custom/components';
import { useListSubjectSimple } from '@/api/exam-subjects';
import { PassageFormValues } from '@/api/exam-passages/types';
import { useTheme } from '@/lib/theme-provider';

type PassageFormProps = {
    defaultValues?: Partial<PassageFormValues>;
    onSubmit: (values: PassageFormValues) => void;
    isPending?: boolean;
};

export function PassageForm({ defaultValues, onSubmit, isPending }: PassageFormProps) {
    const { t } = useAppTranslation();
    const { theme: appTheme } = useTheme();

    const [subjectSearch, setSubjectSearch] = React.useState("");

    // Fetch searchable subjects
    const { data: subjectsData, isFetching: isFetchingSubjects } = useListSubjectSimple({
        limit: 10, // Smaller limit for search
        search: subjectSearch
    });
    const subjectOptions = subjectsData?.data?.items || [];

    // Initialize BlockNote editor
    const editor = useCreateBlockNote({
        initialContent: defaultValues?.content && defaultValues.content.length > 0
            ? defaultValues.content as any
            : undefined,
    });

    const formSchema = z.object({
        title: z.string().min(1, t($ => $.exam.passages.form.title.required)),
        subjectId: z.string().min(1, t($ => $.exam.passages.form.subject.required)),
        content: z.array(z.any()).optional(),
        isActive: z.boolean().default(true),
    });

    const form = useForm<PassageFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            subjectId: "",
            content: [],
            isActive: true,
            ...defaultValues,
        },
    });

    // Reset the form whenever defaultValues change
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                title: "",
                subjectId: "",
                content: [],
                isActive: true,
                ...defaultValues,
            });

            // Reset BlockNote editor content to original value
            if (editor) {
                const originalContent = defaultValues.content && defaultValues.content.length > 0
                    ? defaultValues.content as any
                    : [{ type: "paragraph", content: [] }];
                editor.replaceBlocks(editor.document, originalContent);
            }
        }
    }, [defaultValues, form, editor]);

    // Resolve "system" theme to "light" or "dark"
    const resolvedTheme = appTheme === "system"
        ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : appTheme;

    const onFormSubmit = (values: PassageFormValues) => {
        // Get the latest content from the editor
        const content = editor.document;
        onSubmit({ ...values, content });
    };

    const formConfig = {
        title: {
            type: "text",
            name: "title",
            label: t($ => $.exam.passages.form.title.label),
            placeholder: t($ => $.exam.passages.form.title.placeholder),
        },
        subjectId: {
            type: "combobox",
            name: "subjectId",
            label: t($ => $.exam.passages.form.subject.label),
            placeholder: t($ => $.exam.passages.form.subject.placeholder),
            options: subjectOptions,
            disabled: isFetchingSubjects,
            isLoading: isFetchingSubjects,
            serverSideSearch: true,
            onSearchChange: (val: string) => setSubjectSearch(val),
        },
        isActive: {
            type: "switch",
            name: "isActive",
            label: t($ => $.exam.passages.form.isActive.label),
            description: t($ => $.exam.passages.form.isActive.description),
        },
    };

    return (
        <Form {...form}>
            <FormWithDetector
                form={form}
                onSubmit={onFormSubmit}
                schema={formSchema}
                className=""
            >
                <div className="border border-border rounded-lg bg-card p-6 space-y-6">
                    <ControlForm form={form} item={formConfig.title} showMessage={false} />

                    <ControlForm form={form} item={formConfig.subjectId} showMessage={false} />

                    <ControlForm form={form} item={formConfig.isActive} showMessage={false} />

                    <div className="space-y-2">
                        <FormLabel className="text-foreground font-medium">
                            {t($ => $.exam.passages.form.content.label)}
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.reset();
                                // Revert BlockNote editor content to original value
                                if (editor) {
                                    const originalContent = defaultValues?.content && defaultValues.content.length > 0
                                        ? defaultValues.content as any
                                        : [{ type: "paragraph", content: [] }];
                                    editor.replaceBlocks(editor.document, originalContent);
                                }
                            }}
                        >
                            {t($ => $.labels.cancel)}
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t($ => $.labels.saving) : t($ => $.labels.save)}
                        </Button>
                    </div>
                </div>
            </FormWithDetector>
        </Form>
    );
}
