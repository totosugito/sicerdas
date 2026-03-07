import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { ControlForm } from "@/components/custom/forms";
import {
    ExamCategory,
    useCreateCategory,
    useUpdateCategory,
    CreateCategoryRequest,
    UpdateCategoryRequest
} from "@/api/education-categories";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export type DialogCategoryCreateProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: ExamCategory | null;
};

const FormCategory = ({ values, form }: any) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <ControlForm form={form} item={values.name} showMessage={false} />
            <ControlForm form={form} item={values.description} showMessage={false} />
            <ControlForm form={form} item={values.isActive} showMessage={false} />
        </div>
    );
};

export const DialogCategoryCreate = ({ open, onOpenChange, category }: DialogCategoryCreateProps) => {
    const { t } = useAppTranslation();
    const queryClient = useQueryClient();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    const formSchema = {
        name: z.string().min(1, t($ => $.education.categories.form.name.required)),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
    };

    const formConfig = {
        name: {
            type: "text",
            name: "name",
            label: t($ => $.education.categories.form.name.label),
            placeholder: t($ => $.education.categories.form.name.placeholder),
        },
        description: {
            type: "textarea",
            name: "description",
            label: t($ => $.education.categories.form.description.label),
            placeholder: t($ => $.education.categories.form.description.placeholder),
            minRows: 3,
        },
        isActive: {
            type: "switch",
            name: "isActive",
            label: t($ => $.education.categories.form.isActive.label),
            description: t($ => $.education.categories.form.isActive.description),
        },
    };

    const modalProps: ModalFormProps = {
        title: category ? t($ => $.labels.edit) + " " + t($ => $.education.categories.title) : t($ => $.labels.add) + " " + t($ => $.education.categories.title),
        desc: category ? t($ => $.education.categories.editDescription) : t($ => $.education.categories.createDescription),
        modal: true,
        textConfirm: (createMutation.isPending || updateMutation.isPending) ? t($ => $.labels.saving) : t($ => $.labels.save),
        textCancel: t($ => $.labels.cancel),
        defaultValue: {
            name: category?.name || "",
            description: category?.description || "",
            isActive: category?.isActive ?? true,
        },
        child: formConfig,
        schema: formSchema,
        content: <FormCategory />,
        onCancelClick: () => onOpenChange(false),
        onConfirmClick: async (values) => {
            if (category) {
                await updateMutation.mutateAsync({ id: category.id, ...values } as UpdateCategoryRequest, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t($ => $.education.categories.notifications.updateSuccess) });
                        queryClient.invalidateQueries({ queryKey: ["education-categories-list"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t($ => $.labels.error) });
                    }
                });
            } else {
                await createMutation.mutateAsync(values as CreateCategoryRequest, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t($ => $.education.categories.notifications.createSuccess) });
                        queryClient.invalidateQueries({ queryKey: ["education-categories-list"] });
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
