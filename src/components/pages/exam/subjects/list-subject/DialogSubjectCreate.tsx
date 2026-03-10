import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { ControlForm } from "@/components/custom/forms";
import {
    ExamSubject,
    useCreateSubject,
    useUpdateSubject,
    CreateSubjectRequest,
    UpdateSubjectRequest
} from "@/api/exam-subjects";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export type DialogSubjectCreateProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject?: ExamSubject | null;
};

const FormSubject = ({ values, form }: any) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <ControlForm form={form} item={values.name} showMessage={false} />
            <ControlForm form={form} item={values.description} showMessage={false} />
            <ControlForm form={form} item={values.isActive} showMessage={false} />
        </div>
    );
};

export const DialogSubjectCreate = ({ open, onOpenChange, subject }: DialogSubjectCreateProps) => {
    const { t } = useAppTranslation();
    const queryClient = useQueryClient();
    const createMutation = useCreateSubject();
    const updateMutation = useUpdateSubject();

    const formSchema = {
        name: z.string().min(1, t($ => $.exam.subjects.form.name.required)),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
    };

    const formConfig = {
        name: {
            type: "text",
            name: "name",
            label: t($ => $.exam.subjects.form.name.label),
            placeholder: t($ => $.exam.subjects.form.name.placeholder),
            required: true,
        },
        description: {
            type: "textarea",
            name: "description",
            label: t($ => $.exam.subjects.form.description.label),
            placeholder: t($ => $.exam.subjects.form.description.placeholder),
            minRows: 3,
        },
        isActive: {
            type: "switch",
            name: "isActive",
            label: t($ => $.exam.subjects.form.isActive.label),
            description: t($ => $.exam.subjects.form.isActive.description),
        },
    };

    const modalProps: ModalFormProps = {
        title: subject ? t($ => $.exam.subjects.dialog.editTitle) : t($ => $.exam.subjects.dialog.addTitle),
        desc: subject ? t($ => $.exam.subjects.editDescription) : t($ => $.exam.subjects.createDescription),
        modal: true,
        textConfirm: (createMutation.isPending || updateMutation.isPending) ? t($ => $.labels.saving) : t($ => $.labels.save),
        textCancel: t($ => $.labels.cancel),
        defaultValue: {
            name: subject?.name || "",
            description: subject?.description || "",
            isActive: subject?.isActive ?? true,
        },
        child: formConfig,
        schema: formSchema,
        content: <FormSubject />,
        onCancelClick: () => onOpenChange(false),
        onConfirmClick: async (values) => {
            if (subject) {
                await updateMutation.mutateAsync({ id: subject.id, ...(values as any) } as UpdateSubjectRequest, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t($ => $.exam.subjects.notifications.updateSuccess) });
                        queryClient.invalidateQueries({ queryKey: ["exam-subjects-list"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t($ => $.labels.error) });
                    }
                });
            } else {
                await createMutation.mutateAsync(values as CreateSubjectRequest, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t($ => $.exam.subjects.notifications.createSuccess) });
                        queryClient.invalidateQueries({ queryKey: ["exam-subjects-list"] });
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
