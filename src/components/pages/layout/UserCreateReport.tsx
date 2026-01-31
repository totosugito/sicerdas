import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useCreateReportMutation } from "@/api/report/create-report";
import { EnumContentType } from "backend/src/db/schema/enum-app";
import { EnumReportReason } from "backend/src/db/schema/enum-general";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { showNotifError, showNotifSuccess } from "@/lib/show-notif";
import { ControlForm } from "@/components/custom/forms";
import { ObjToOptionList } from "@/lib/my-utils";

export type UserCreateReportProps = {
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

const FormUserReport = ({ values, form }: any) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            {/* name */}
            <ControlForm form={form} item={values.name} showMessage={false} />

            {/* email */}
            <ControlForm form={form} item={values.email} showMessage={false} />

            {/* reason */}
            <ControlForm form={form} item={values.reason} showMessage={false} />

            {/* description */}
            <ControlForm form={form} item={values.description} showMessage={false} />
        </div>
    );
};

export const UserCreateReport = ({ isOpen, onOpenChange, data }: UserCreateReportProps) => {
    const { t } = useTranslation();
    const mutation = useCreateReportMutation();

    const formSchema = {
        name: z.string().min(1, t("report.validation.name_required")),
        email: z.email(t("report.validation.email_invalid")).min(1, t("report.validation.email_required")),
        reason: z.string().min(1, t("report.validation.reason_required")),
        title: z.string(),
        description: z.string().optional(),
    };

    const formConfig = {
        name: {
            type: "text",
            name: "name",
            label: t("report.field.name"),
            placeholder: t("report.field.name_placeholder"),
        },
        email: {
            type: "email",
            name: "email",
            label: t("report.field.email"),
            placeholder: t("report.field.email_placeholder"),
        },
        reason: {
            type: "select",
            name: "reason",
            label: t("report.field.reason"),
            placeholder: t("report.field.reason_placeholder"),
            options: ObjToOptionList(EnumReportReason).map((opt) => ({
                ...opt,
                label: t(`report.reportReason.${opt.value.toLowerCase()}`),
            })),
        },
        title: {
            type: "text",
            name: "title",
            label: t("report.field.title"),
            placeholder: t("report.field.title_placeholder"),
        },
        description: {
            type: "textarea",
            name: "description",
            label: t("report.field.description"),
            placeholder: t("report.field.description_placeholder"),
            minRows: 4,
            maxRows: 7
        },
    };

    const modalProps: ModalFormProps = {
        title: t("report.create.title", { title: data.title }) || `Report: ${data.title}`,
        desc: t("report.create.desc"),
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
        content: <FormUserReport />,
        onCancelClick: () => onOpenChange(false),
        onConfirmClick: (values) => {
            mutation.mutate(
                {
                    body: {
                        title: data.title,
                        contentType: data.contentType,
                        referenceId: data.referenceId,
                        name: values.name,
                        email: values.email,
                        reason: values.reason as (typeof EnumReportReason)[keyof typeof EnumReportReason],
                        description: values.description,
                    },
                },
                {
                    onSuccess: () => {
                        showNotifSuccess({ message: t("report.create.success") });
                        onOpenChange(false);
                    },
                    onError: (err: any) => {
                        showNotifError({ message: err?.message || t("report.create.error") });
                    },
                }
            );
        },
    };

    if (!isOpen) return null;

    return <DialogModalForm modal={modalProps} />;
};
