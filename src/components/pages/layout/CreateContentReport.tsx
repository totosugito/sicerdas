import { DialogModalForm, ModalFormProps, DialogModal } from "@/components/custom/components";
import { useState } from "react";
import { useCreateReportMutation } from "@/api/content-report/create-report";
import { EnumContentType } from "backend/src/db/schema/enum-app";
import { EnumReportReason } from "backend/src/db/schema/enum-general";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ControlForm } from "@/components/custom/forms";

export type CreateContentReportProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: {
        contentType: (typeof EnumContentType)[keyof typeof EnumContentType];
        referenceId: string;
        title: string;
        name?: string;
        email?: string;
    };
};

const FormCreateContentReport = ({ values, form, isLoggedIn }: any) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            {/* name */}
            {!isLoggedIn && <ControlForm form={form} item={values.name} showMessage={false} />}

            {/* email */}
            {!isLoggedIn && <ControlForm form={form} item={values.email} showMessage={false} />}

            {/* reason */}
            <ControlForm form={form} item={values.reason} showMessage={false} />

            {/* description */}
            <ControlForm form={form} item={values.description} showMessage={false} />
        </div>
    );
};

export const CreateContentReport = ({ isOpen, onOpenChange, data }: CreateContentReportProps) => {
    const { t } = useTranslation();
    const mutation = useCreateReportMutation();
    const [showSuccess, setShowSuccess] = useState(false);
    const isLoggedIn = !!data.name && !!data.email;

    const formSchema = {
        name: z.string().min(1, t("contentReport.validation.name_required")),
        email: z.email(t("contentReport.validation.email_invalid")).min(1, t("contentReport.validation.email_required")),
        reason: z.string().min(1, t("contentReport.validation.reason_required")),
        title: z.string(),
        description: z.string().optional(),
    };

    const formConfig = {
        name: {
            type: "text",
            name: "name",
            label: t("contentReport.field.name"),
            placeholder: t("contentReport.field.name_placeholder"),
        },
        email: {
            type: "email",
            name: "email",
            label: t("contentReport.field.email"),
            placeholder: t("contentReport.field.email_placeholder"),
        },
        reason: {
            type: "select",
            name: "reason",
            label: t("contentReport.field.reason"),
            placeholder: t("contentReport.field.reason_placeholder"),
            options: Object.values(EnumReportReason).map((reason) => ({
                value: reason,
                label: t(`contentReport.reportReason.${reason}`),
            })),
        },
        title: {
            type: "text",
            name: "title",
            label: t("contentReport.field.title"),
            placeholder: t("contentReport.field.title_placeholder"),
        },
        description: {
            type: "textarea",
            name: "description",
            label: t("contentReport.field.description"),
            placeholder: t("contentReport.field.description_placeholder"),
            minRows: 4,
            maxRows: 7
        },
    };

    const modalProps: ModalFormProps = {
        title: t("contentReport.create.title", { title: data.title }) || `Report: ${data.title}`,
        desc: t("contentReport.create.desc"),
        modal: true,
        textConfirm: t("labels.submit"),
        textCancel: t("labels.cancel"),
        defaultValue: {
            name: data.name || "",
            email: data.email || "",
            title: data.title || "",
            reason: "",
            description: "",
        },
        child: formConfig,
        schema: formSchema,
        content: <FormCreateContentReport isLoggedIn={isLoggedIn} />,
        onCancelClick: () => onOpenChange(false),
        onConfirmClick: async (values) => {
            try {
                await mutation.mutateAsync({
                    body: {
                        title: data.title,
                        contentType: data.contentType,
                        referenceId: data.referenceId,
                        name: values.name,
                        email: values.email,
                        reason: values.reason as (typeof EnumReportReason)[keyof typeof EnumReportReason],
                        description: values.description,
                    },
                });
                setShowSuccess(true);
            } catch (err: any) {
                throw err;
            }
        },
    };

    if (!isOpen) return null;

    if (showSuccess) {
        return (
            <DialogModal
                modal={{
                    title: t("contentReport.create.success_title"),
                    desc: t("contentReport.create.success_desc"),
                    iconType: "success",
                    textConfirm: t("labels.close"),
                    onConfirmClick: () => {
                        setShowSuccess(false);
                        onOpenChange(false);
                    },
                    modal: true,
                    showCloseButton: true,
                }}
            />
        );
    }

    return <DialogModalForm modal={modalProps} />;
};
