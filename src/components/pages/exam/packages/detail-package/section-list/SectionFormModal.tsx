import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { ControlForm } from "@/components/custom/forms";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useCreatePackageSection, useUpdatePackageSection, ExamPackageSection } from "@/api/exam-package-sections";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export type SectionFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    section?: ExamPackageSection | null;
    packageId: string;
};

const FormEntity = ({ values, form }: any) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <ControlForm form={form} item={values.title} />
            <ControlForm form={form} item={values.durationMinutes} />
            <ControlForm form={form} item={values.isActive} />
        </div>
    );
};

export const SectionFormModal = ({ open, onOpenChange, section, packageId }: SectionFormModalProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const createMutation = useCreatePackageSection();
    const updateMutation = useUpdatePackageSection();

    const formSchema = {
        title: z.string().min(1, t('exam.packages.detail.sections.formTitleRequired', "Title is required")),
        durationMinutes: z.preprocess((val) => {
            if (val === "" || val === null || val === undefined) return null;
            const num = Number(val);
            return isNaN(num) ? null : num;
        }, z.number().nullable().optional()),
        isActive: z.boolean().default(true),
    };

    const formConfig = {
        title: {
            type: "text",
            name: "title",
            label: t('exam.packages.detail.sections.formTitle', "Title"),
            placeholder: t('exam.packages.detail.sections.formTitlePlaceholder', "Enter section title"),
        },
        durationMinutes: {
            type: "number",
            name: "durationMinutes",
            label: t('exam.packages.detail.sections.formDuration', "Duration (Minutes)"),
            placeholder: t('exam.packages.detail.sections.formDurationPlaceholder', "Optional"),
            description: t('exam.packages.detail.sections.formDurationHelp', "Leave empty if there is no time limit."),
        },
        isActive: {
            type: "switch",
            name: "isActive",
            label: t('exam.packages.detail.sections.formActive', "Active"),
            description: t('exam.packages.detail.sections.formActiveHelp', "Show this section to students."),
        },
    };

    const modalProps: ModalFormProps = {
        title: section
            ? t('exam.packages.detail.sections.editTitle', "Edit Section")
            : t('exam.packages.detail.sections.createTitle', "Create Section"),
        desc: section
            ? t('exam.packages.detail.sections.editDesc', "Update the details of this section.")
            : t('exam.packages.detail.sections.createDesc', "Add a new section to this exam package."),
        modal: true,
        textConfirm: (createMutation.isPending || updateMutation.isPending) ? t("common.saving", "Saving...") : t("common.save", "Save"),
        textCancel: t("common.cancel", "Cancel"),
        defaultValue: {
            title: section?.title || "",
            durationMinutes: section?.durationMinutes ?? null,
            isActive: section?.isActive ?? true,
        },
        child: formConfig,
        schema: formSchema,
        content: <FormEntity />,
        onCancelClick: () => onOpenChange(false),
        onConfirmClick: async (values) => {
            if (section) {
                // EDIT MODE
                await updateMutation.mutateAsync({
                    id: section.id,
                    title: values.title,
                    durationMinutes: values.durationMinutes ?? undefined,
                    isActive: values.isActive
                }, {
                    onSuccess: () => {
                        showNotifSuccess({ message: t('exam.packages.detail.sections.updateSuccess', "Section updated successfully") });
                        queryClient.invalidateQueries({ queryKey: ["exam-package-sections-list"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t('exam.packages.detail.sections.updateError', "Failed to update section") });
                    }
                });
            } else {
                // CREATE MODE
                await createMutation.mutateAsync({
                    packageId,
                    title: values.title,
                    durationMinutes: values.durationMinutes ?? undefined,
                    isActive: values.isActive
                }, {
                    onSuccess: () => {
                        showNotifSuccess({ message: t('exam.packages.detail.sections.createSuccess', "Section created successfully") });
                        queryClient.invalidateQueries({ queryKey: ["exam-package-sections-list"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t('exam.packages.detail.sections.createError', "Failed to create section") });
                    }
                });
            }
        },
    };

    if (!open) return null;

    return <DialogModalForm modal={modalProps} />;
};
