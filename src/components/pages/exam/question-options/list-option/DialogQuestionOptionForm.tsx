import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { ControlForm } from "@/components/custom/forms";
import {
    useCreateQuestionOption,
    useUpdateQuestionOption,
} from "@/api/exam-question-options";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

import { ExamQuestion } from "@/api/exam-questions";

import { blocknote_to_text } from "@/lib/blocknote-utils";

export type DialogQuestionOptionFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionId: string;
    option?: NonNullable<ExamQuestion['options']>[number] | null;
    nextOrder?: number;
};

const FormOption = ({ values, form }: any) => {
    return (
        <div className="flex flex-col gap-6 w-full">
            <ControlForm form={form} item={values.content} showMessage={false} />
            <ControlForm form={form} item={values.isCorrect} showMessage={false} />
        </div>
    );
};

export const DialogQuestionOptionForm = ({ open, onOpenChange, questionId, option, nextOrder }: DialogQuestionOptionFormProps) => {
    const { t } = useAppTranslation();
    const queryClient = useQueryClient();
    const createMutation = useCreateQuestionOption();
    const updateMutation = useUpdateQuestionOption();

    const formSchema = {
        content: z.array(z.record(z.string(), z.unknown()))
            .min(1, t($ => $.exam.options.form.content.required))
            .refine(val => blocknote_to_text(val).trim().length > 0, {
                message: t($ => $.exam.options.form.content.required)
            }),
        isCorrect: z.boolean().default(false),
    };

    const formConfig = {
        content: {
            type: "blocknote",
            name: "content",
            label: t($ => $.exam.options.form.content.label),
            placeholder: t($ => $.exam.options.form.content.placeholder),
            wrapperClassName: "min-h-[300px]",
            required: true,
        },
        isCorrect: {
            type: "switch",
            name: "isCorrect",
            label: t($ => $.exam.options.form.isCorrect.label),
            description: t($ => $.exam.options.form.isCorrect.description),
        },
    };

    const modalProps: ModalFormProps = {
        title: option ? t($ => $.exam.options.dialog.editTitle) : t($ => $.exam.options.dialog.addTitle),
        desc: option ? t($ => $.exam.options.dialog.editDescription) : t($ => $.exam.options.dialog.addDescription),
        modal: true,
        textConfirm: (createMutation.isPending || updateMutation.isPending) ? t($ => $.labels.saving) : t($ => $.labels.save),
        textCancel: t($ => $.labels.cancel),
        defaultValue: {
            content: option?.content && option.content.length > 0 ? option.content : [{ type: "paragraph", content: [] }],
            isCorrect: option?.isCorrect ?? false,
        },
        child: formConfig,
        schema: formSchema,
        content: <FormOption />,
        onCancelClick: () => onOpenChange(false),
        onConfirmClick: async (values: any) => {
            if (option) {
                // UPDATE
                await updateMutation.mutateAsync({
                    id: option.id,
                    content: values.content,
                    isCorrect: values.isCorrect
                }, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t($ => $.exam.options.notifications.updateSuccess) });
                        queryClient.invalidateQueries({ queryKey: ["admin-exam-question-detail"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t($ => $.labels.error) });
                    }
                });
            } else {
                // CREATE
                await createMutation.mutateAsync({
                    questionId,
                    content: values.content,
                    isCorrect: values.isCorrect,
                    order: nextOrder || 1
                }, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t($ => $.exam.options.notifications.createSuccess) });
                        queryClient.invalidateQueries({ queryKey: ["admin-exam-question-detail"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t($ => $.labels.error) });
                    }
                });
            }
        },
    };

    if (!open) return null;

    return <DialogModalForm modal={modalProps} />;
};
