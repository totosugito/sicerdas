import React from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { DialogModalForm } from "@/components/custom/components/DialogModalForm";
import { ControlForm } from "@/components/custom/forms";
import { z } from "zod";

interface DialogLocalReasonFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reasonContent: any[];
  onConfirm: (newReasonContent: any[]) => void;
}

const formSchema = {
  reasonContent: z.array(z.record(z.string(), z.unknown())).min(1),
};

// Content component for DialogModalForm
const ContentInner = ({ form }: { form: any }) => {
  const { t } = useAppTranslation();

  const formConfig = {
    reasonContent: {
      type: "blocknote",
      name: "reasonContent",
      label: t(($) => $.exam.questions.form.reasonContent.label),
      placeholder: t(($) => $.exam.questions.form.reasonContent.placeholder),
      wrapperClassName: "min-h-[400px]",
    },
  };

  return <ControlForm form={form} item={formConfig.reasonContent} />;
};

export function DialogLocalReasonForm({
  open,
  onOpenChange,
  reasonContent,
  onConfirm,
}: DialogLocalReasonFormProps) {
  const { t } = useAppTranslation();

  if (!open) return null;

  return (
    <DialogModalForm
      modal={{
        title: t(($) => $.exam.questions.form.reasonContent.label),
        defaultValue: { reasonContent },
        schema: formSchema,
        content: <ContentInner form={undefined} />, // form is injected by DialogModalForm
        child: true, // trick to trigger cloneElement
        onConfirmClick: (values) => {
          onConfirm(values.reasonContent);
          onOpenChange(false);
        },
        onCancelClick: () => onOpenChange(false),
      }}
    />
  );
}
