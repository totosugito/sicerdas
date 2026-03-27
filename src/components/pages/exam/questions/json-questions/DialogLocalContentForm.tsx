import React from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { DialogModalForm } from "@/components/custom/components/DialogModalForm";
import { ControlForm } from "@/components/custom/forms";
import { z } from "zod";

interface DialogLocalContentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: any[];
  onConfirm: (newContent: any[]) => void;
}

const formSchema = {
  content: z.array(z.record(z.string(), z.unknown())).min(1),
};

// Content component for DialogModalForm
const ContentInner = ({ form }: { form: any }) => {
  const { t } = useAppTranslation();

  const formConfig = {
    content: {
      type: "blocknote",
      name: "content",
      label: t(($) => $.exam.questions.form.content.label),
      placeholder: t(($) => $.exam.questions.form.content.placeholder),
      wrapperClassName: "min-h-[400px]",
    },
  };

  return <ControlForm form={form} item={formConfig.content} />;
};

export function DialogLocalContentForm({
  open,
  onOpenChange,
  content,
  onConfirm,
}: DialogLocalContentFormProps) {
  const { t } = useAppTranslation();

  if (!open) return null;

  return (
    <DialogModalForm
      modal={{
        title: t(($) => $.exam.questions.edit.content.title),
        defaultValue: { content },
        schema: formSchema,
        content: <ContentInner form={undefined} />, // form is injected by DialogModalForm
        child: true, // trick to trigger cloneElement
        onConfirmClick: (values) => {
          onConfirm(values.content);
          onOpenChange(false);
        },
        onCancelClick: () => onOpenChange(false),
      }}
    />
  );
}
