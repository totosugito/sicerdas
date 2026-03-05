import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ControlForm } from "@/components/custom/forms";
import {
    EducationGrade,
    useCreateEducationGrade,
    useUpdateEducationGrade,
    CreateEducationGradeRequest,
    UpdateEducationGradeRequest
} from "@/api/education-grade";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export type DialogGradeCreateProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gradeData?: EducationGrade | null;
};

const FormGrade = ({ values, form }: any) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <ControlForm form={form} item={values.grade} disabled={values.grade.disabled} showMessage={false} />
            <ControlForm form={form} item={values.name} showMessage={false} />
            <ControlForm form={form} item={values.desc} showMessage={false} />
        </div>
    );
};

export const DialogGradeCreate = ({ open, onOpenChange, gradeData }: DialogGradeCreateProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const createMutation = useCreateEducationGrade();
    const updateMutation = useUpdateEducationGrade();

    const formSchema = {
        grade: z.string()
            .min(1, t("education.grade.form.grade.required"))
            .max(32)
            .regex(/^[a-z0-9_\-]+$/, t("education.grade.form.grade.invalidFormat")),
        name: z.string().min(1, t("education.grade.form.name.required")).max(128),
        desc: z.string().optional(),
    };

    const formConfig = {
        grade: {
            type: "text",
            name: "grade",
            label: t("education.grade.form.grade.label"),
            placeholder: t("education.grade.form.grade.placeholder"),
            disabled: !!gradeData,
        },
        name: {
            type: "text",
            name: "name",
            label: t("education.grade.form.name.label"),
            placeholder: t("education.grade.form.name.placeholder"),
        },
        desc: {
            type: "textarea",
            name: "desc",
            label: t("education.grade.form.desc.label"),
            placeholder: t("education.grade.form.desc.placeholder"),
            minRows: 3,
        },
    };

    const modalProps: ModalFormProps = {
        title: gradeData ? t("labels.edit") + " " + t("education.grade.title") : t("labels.add") + " " + t("education.grade.title"),
        desc: gradeData ? t("education.grade.editDescription") : t("education.grade.createDescription"),
        modal: true,
        textConfirm: (createMutation.isPending || updateMutation.isPending) ? t("labels.saving") : t("labels.save"),
        textCancel: t("labels.cancel"),
        defaultValue: {
            grade: gradeData?.grade || "",
            name: gradeData?.name || "",
            desc: gradeData?.desc || "",
        },
        child: formConfig,
        schema: formSchema,
        content: <FormGrade />,
        onCancelClick: () => onOpenChange(false),
        onConfirmClick: async (values) => {
            if (gradeData) {
                // remove 'grade' payload mapping on update per api mapping rules!
                const { grade, ...payloadWithoutGrade } = values as any;

                await updateMutation.mutateAsync({ id: gradeData.id, ...payloadWithoutGrade } as UpdateEducationGradeRequest, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t("education.grade.notifications.updateSuccess") });
                        queryClient.invalidateQueries({ queryKey: ["education-grade-list"] });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err.message || t("labels.error") });
                    }
                });
            } else {
                await createMutation.mutateAsync(values as CreateEducationGradeRequest, {
                    onSuccess: (res) => {
                        showNotifSuccess({ message: res.message || t("education.grade.notifications.createSuccess") });
                        queryClient.invalidateQueries({ queryKey: ["education-grade-list"] });
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
