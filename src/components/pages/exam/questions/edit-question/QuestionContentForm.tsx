import React, { useEffect } from 'react';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useAppTranslation } from '@/lib/i18n-typed';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/lib/theme-provider';
import { ExamQuestion } from '@/api/exam-questions/types';

type QuestionContentFormProps = {
    question: ExamQuestion;
    onSubmit: (content: any[]) => void;
    isPending?: boolean;
};

export function QuestionContentForm({ question, onSubmit, isPending }: QuestionContentFormProps) {
    const { t } = useAppTranslation();
    const { theme: appTheme } = useTheme();

    const editor = useCreateBlockNote({
        initialContent: question.content && question.content.length > 0
            ? question.content as any
            : undefined,
    });

    useEffect(() => {
        if (question && editor) {
            const originalContent = question.content && question.content.length > 0
                ? question.content as any
                : [{ type: "paragraph", content: [] }];
            editor.replaceBlocks(editor.document, originalContent);
        }
    }, [question, editor]);

    const resolvedTheme = appTheme === "system"
        ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : appTheme;

    const handleSave = () => {
        const content = editor.document;
        onSubmit(content);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3 flex flex-col">
                <Label className="text-xl font-semibold flex items-center gap-2">
                    {t($ => $.exam.questions.form.content.label)}
                </Label>
                <div className="min-h-[500px] border-2 border-dashed rounded-xl bg-background overflow-hidden shadow-inner">
                    <BlockNoteView editor={editor} theme={resolvedTheme} />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t font-semibold">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        if (editor) {
                            const originalContent = question.content && question.content.length > 0
                                ? question.content as any
                                : [{ type: "paragraph", content: [] }];
                            editor.replaceBlocks(editor.document, originalContent);
                        }
                    }}
                    disabled={isPending}
                >
                    {t($ => $.labels.cancel)}
                </Button>
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                >
                    {isPending ? t($ => $.labels.saving) : t($ => $.labels.save)}
                </Button>
            </div>
        </div>
    );
}
