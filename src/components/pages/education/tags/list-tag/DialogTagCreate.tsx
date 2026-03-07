import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ControlForm } from "@/components/custom/forms";
import {
    ExamTag,
    useCreateTag,
    useUpdateTag,
    CreateTagRequest,
    UpdateTagRequest
} from "@/api/education-tags";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export type DialogTagCreateProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tag?: ExamTag | null;
};

const FormTag = ({ values, form }: any) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <ControlForm form={form} item={values.name} showMessage={false} />
            <ControlForm form={form} item={values.description} showMessage={false} />
            <ControlForm form={form} item={values.isActive} showMessage={false} />
        </div>
    );
};

export const DialogTagCreate = ({ open, onOpenChange, tag }: DialogTagCreateProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const createMutation = useCreateTag();
    const updateMutation = useUpdateTag();

    const formSchema = {
        name: z.string().min(1, t("education.tags.list.form.name.required")),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
    };

    const formConfig = {
        name: {
            type: "text",
            name: "name",
            label: t("education.tags.list.form.name.label"),
            placeholder: t("education.tags.list.form.name.placeholder"),
        },
        description: {
            type: "textarea",
            name: "description",
            label: t("education.tags.list.form.description.label"),
            placeholder: t("education.tags.list.form.description.placeholder"),
            minRows: 3,
        },
        isActive: {
            type: "switch",
            name: "isActive",
            label: t("education.tags.list.form.isActive.label"),
            description: t("education.tags.list.form.isActive.description"),
        },
    };

    const modalProps: ModalFormProps = {
        title: tag ? t("labels.edit") + " " + t("education.tags.list.title") : t("labels.add") + " " + t("education.tags.list.title"),
        desc: tag ? t("education.tags.list.editDescription") : t("education.tags.list.createDescription"),
        modal: true,
        textConfirm: (createMutation.isPending || updateMutation.isPending) ? t("labels.saving") : t("labels.save"),
        textCancel: t("labels.cancel"),
        defaultValue: {
            name: tag?.name || "",
            description: tag?.description || "",
            isActive: tag?.isActive ?? true,
        },
        child: formConfig,
        schema: formSchema,
        content: <FormTag />,
        onCancelClick: () => onOpenChange(false),
        onConfirmClick: async (values) => {
            if (tag) {
                await updateMutation.mutateAsync({ id: tag.id, ...values } as UpdateTagRequest, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t("education.tags.list.notifications.updateSuccess") });
                        queryClient.invalidateQueries({ queryKey: ["education-tags-list"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t("labels.error") });
                    }
                });
            } else {
                await createMutation.mutateAsync(values as CreateTagRequest, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t("education.tags.list.notifications.createSuccess") });
                        queryClient.invalidateQueries({ queryKey: ["education-tags-list"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t("labels.error") });
                    }
                });
            }
        },
    };

    if (!open) return null;

    return <DialogModalForm modal={modalProps} />;
};
