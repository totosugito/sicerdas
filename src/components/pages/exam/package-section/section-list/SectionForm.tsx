import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { ControlForm } from "@/components/custom/forms";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useCreatePackageSection, useUpdatePackageSection, ExamPackageSection } from "@/api/exam-package-sections";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { durationOnMinutes } from "@/constants/app-enum";

export type SectionFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    section?: ExamPackageSection | null;
    packageId: string;
};

const FormEntity = ({ values, form }: any) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <ControlForm form={form} item={values.title} showMessage={false} />
            <ControlForm form={form} item={values.durationMinutes} showMessage={false} />
            <ControlForm form={form} item={values.isActive} showMessage={false} />
        </div>
    );
};

export const SectionForm = ({ open, onOpenChange, section, packageId }: SectionFormProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const createMutation = useCreatePackageSection();
    const updateMutation = useUpdatePackageSection();

    const formSchema = {
        title: z.string().min(1, t('exam.packageSection.list.formTitleRequired')),
        durationMinutes: z.coerce.number().min(0, t('exam.packageSection.list.formDurationRequired')),
        isActive: z.boolean().default(true),
    };

    const formConfig = {
        title: {
            type: "text",
            name: "title",
            label: t('exam.packageSection.list.formTitle'),
            placeholder: t('exam.packageSection.list.formTitlePlaceholder'),
        },
        durationMinutes: {
            type: "select",
            name: "durationMinutes",
            label: t('exam.packageSection.list.formDuration'),
            placeholder: t('exam.packageSection.list.formDurationPlaceholder'),
            description: t('exam.packageSection.list.formDurationHelp'),
            options: durationOnMinutes
        },
        isActive: {
            type: "switch",
            name: "isActive",
            label: t('exam.packageSection.list.formActive'),
            description: t('exam.packageSection.list.formActiveHelp'),
        },
    };

    const modalProps: ModalFormProps = {
        title: section
            ? t('exam.packageSection.list.editTitle')
            : t('exam.packageSection.list.createTitle'),
        desc: section
            ? t('exam.packageSection.list.editDesc')
            : t('exam.packageSection.list.createDesc'),
        modal: true,
        textConfirm: (createMutation.isPending || updateMutation.isPending) ? t("labels.saving") : t("labels.save"),
        textCancel: t("labels.cancel"),
        defaultValue: {
            title: section?.title || "",
            durationMinutes: (section?.durationMinutes ?? 0).toString(),
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
                    durationMinutes: values.durationMinutes !== undefined && values.durationMinutes !== "" ? Number(values.durationMinutes) : 0,
                    isActive: values.isActive
                }, {
                    onSuccess: () => {
                        showNotifSuccess({ message: t('exam.packageSection.list.updateSuccess') });
                        queryClient.invalidateQueries({ queryKey: ["exam-package-sections-list"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t('exam.packageSection.list.updateError') });
                    }
                });
            } else {
                // CREATE MODE
                await createMutation.mutateAsync({
                    packageId,
                    title: values.title,
                    durationMinutes: values.durationMinutes !== undefined && values.durationMinutes !== "" ? Number(values.durationMinutes) : 0,
                    isActive: values.isActive
                }, {
                    onSuccess: () => {
                        showNotifSuccess({ message: t('exam.packageSection.list.createSuccess') });
                        queryClient.invalidateQueries({ queryKey: ["exam-package-sections-list"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t('exam.packageSection.list.createError') });
                    }
                });
            }
        },
    };

    if (!open) return null;

    return <DialogModalForm modal={modalProps} />;
};
