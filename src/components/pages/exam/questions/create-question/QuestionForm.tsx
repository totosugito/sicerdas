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
import { Form, FormLabel } from '@/components/ui/form';
import { ControlForm } from '@/components/custom/forms';
import { FormWithDetector } from '@/components/custom/components';
import { useListSubjectSimple } from '@/api/exam-subjects';
import { useListPassageSimple } from '@/api/exam-passages';
import { useListTier } from '@/api/app-tier';
import { useListGradeSimple } from '@/api/education-grade';
import { QuestionFormValues, EnumDifficultyLevel, EnumQuestionType } from '@/api/exam-questions/types';
import { useTheme } from '@/lib/theme-provider';

type InternalQuestionFormValues = Omit<QuestionFormValues, 'educationGradeId'> & {
    educationGradeId?: string | number | null;
};

type QuestionFormProps = {
    defaultValues?: Partial<QuestionFormValues>;
    onSubmit: (values: QuestionFormValues) => void;
    isPending?: boolean;
};

export function QuestionForm({ defaultValues, onSubmit, isPending }: QuestionFormProps) {
    const { t } = useAppTranslation();
    const { theme: appTheme } = useTheme();

    // Data for dropdowns (Fetching all active options at once)
    const { data: subjectsData, isFetching: isFetchingSubjects } = useListSubjectSimple({ limit: 1000 });
    const { data: passagesData, isFetching: isFetchingPassages } = useListPassageSimple({ limit: 1000 });
    const { data: gradesData, isFetching: isFetchingGrades } = useListGradeSimple({ limit: 1000 });
    const { data: tierData, isLoading: isLoadingTier } = useListTier();

    const subjectOptions = subjectsData?.data?.items || [];
    const passageOptions = passagesData?.data?.items || [];
    const gradeOptions = gradesData?.data?.items || [];

    // Initialize BlockNote editor
    const editor = useCreateBlockNote({
        initialContent: defaultValues?.content && defaultValues.content.length > 0
            ? defaultValues.content as any
            : undefined,
    });


    const formSchema = z.object({
        subjectId: z.string().min(1, t($ => $.exam.questions.list.form.subject.required)),
        passageId: z.string().nullable().optional(),
        content: z.array(z.any()).optional(),
        difficulty: z.enum(Object.values(EnumDifficultyLevel) as [string, ...string[]]),
        type: z.enum(Object.values(EnumQuestionType) as [string, ...string[]]),
        requiredTier: z.string().nullable().optional(),
        educationGradeId: z.union([z.number(), z.string(), z.null()]).optional(),
        isActive: z.boolean().default(true),
    });

    const form = useForm<InternalQuestionFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            subjectId: "",
            passageId: null,
            content: [],
            difficulty: "medium",
            type: "multiple_choice",
            requiredTier: "free",
            educationGradeId: "",
            isActive: true,
            ...defaultValues as any,
        },
    });

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                subjectId: "",
                passageId: null,
                content: [],
                difficulty: "medium",
                type: "multiple_choice",
                requiredTier: "free",
                educationGradeId: "",
                isActive: true,
                ...defaultValues,
            });

            if (editor) {
                const originalContent = defaultValues.content && defaultValues.content.length > 0
                    ? defaultValues.content as any
                    : [{ type: "paragraph", content: [] }];
                editor.replaceBlocks(editor.document, originalContent);
            }
        }
    }, [defaultValues, form, editor]);

    const resolvedTheme = appTheme === "system"
        ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : appTheme;

    const onFormSubmit = (values: any) => {
        const content = editor.document;
        onSubmit({ ...values, content });
    };

    const tierOptions = tierData?.data?.map((tier: any) => ({
        label: tier.name,
        value: tier.slug
    })) || [];

    const difficultyOptions = [
        { label: t($ => $.exam.questions.list.form.difficulty.options.easy), value: EnumDifficultyLevel.EASY },
        { label: t($ => $.exam.questions.list.form.difficulty.options.medium), value: EnumDifficultyLevel.MEDIUM },
        { label: t($ => $.exam.questions.list.form.difficulty.options.hard), value: EnumDifficultyLevel.HARD },
    ];

    const typeOptions = [
        { label: t($ => $.exam.questions.list.form.type.options.multiple_choice), value: EnumQuestionType.MULTIPLE_CHOICE },
        { label: t($ => $.exam.questions.list.form.type.options.essay), value: EnumQuestionType.ESSAY },
    ];

    const formConfig = {
        subjectId: {
            type: "combobox",
            name: "subjectId",
            label: t($ => $.exam.questions.list.form.subject.label),
            placeholder: t($ => $.exam.questions.list.form.subject.placeholder),
            options: subjectOptions,
            disabled: isFetchingSubjects,
            isLoading: isFetchingSubjects,
        },
        passageId: {
            type: "combobox",
            name: "passageId",
            label: t($ => $.exam.questions.list.form.passage.label),
            placeholder: t($ => $.exam.questions.list.form.passage.placeholder),
            options: passageOptions,
            disabled: isFetchingPassages,
            isLoading: isFetchingPassages,
        },
        difficulty: {
            type: "select",
            name: "difficulty",
            label: t($ => $.exam.questions.list.form.difficulty.label),
            placeholder: t($ => $.exam.questions.list.form.difficulty.placeholder),
            options: difficultyOptions,
        },
        type: {
            type: "select",
            name: "type",
            label: t($ => $.exam.questions.list.form.type.label),
            placeholder: t($ => $.exam.questions.list.form.type.placeholder),
            options: typeOptions,
        },
        requiredTier: {
            type: "select",
            name: "requiredTier",
            label: t($ => $.exam.questions.list.form.requiredTier.label),
            placeholder: t($ => $.exam.questions.list.form.requiredTier.placeholder),
            options: tierOptions,
            disabled: isLoadingTier,
        },
        educationGradeId: {
            type: "combobox",
            name: "educationGradeId",
            label: t($ => $.exam.questions.list.form.educationGrade.label),
            placeholder: t($ => $.exam.questions.list.form.educationGrade.placeholder),
            options: gradeOptions,
            disabled: isFetchingGrades,
            isLoading: isFetchingGrades,
        },
        isActive: {
            type: "switch",
            name: "isActive",
            label: t($ => $.exam.questions.list.form.isActive.label),
            description: t($ => $.exam.questions.list.form.isActive.description),
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-border rounded-lg bg-card p-6 space-y-6">
                        <ControlForm form={form} item={formConfig.subjectId} showMessage={false} />
                        <ControlForm form={form} item={formConfig.passageId} showMessage={false} />

                        <div className="grid grid-cols-2 gap-4">
                            <ControlForm form={form} item={formConfig.difficulty} showMessage={false} />
                            <ControlForm form={form} item={formConfig.type} showMessage={false} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <ControlForm form={form} item={formConfig.requiredTier} showMessage={false} />
                            <ControlForm form={form} item={formConfig.educationGradeId} showMessage={false} />
                        </div>

                        <ControlForm form={form} item={formConfig.isActive} showMessage={false} />
                    </div>

                    <div className="border border-border rounded-lg bg-card p-6 space-y-6 flex flex-col">
                        <div className="space-y-2 flex-1 flex flex-col">
                            <FormLabel className="text-foreground font-medium">
                                {t($ => $.exam.questions.list.form.content.label)}
                            </FormLabel>
                            <div className="min-h-[400px] border rounded-md bg-background flex-1 overflow-hidden">
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
                </div>
            </FormWithDetector>
        </Form>
    );
}
