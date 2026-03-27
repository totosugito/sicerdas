import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import React from "react";
import { ControlForm } from "@/components/custom/forms";
import { EnumSolutionType } from "@/api/exam-questions/types";
import { useListTier } from "@/api/app-tier";
import { blocknote_to_text } from "@/lib/blocknote-utils";
import { ExamQuestionSolution } from "@/api/exam-question-solutions";

export type DialogLocalSolutionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solution?: ExamQuestionSolution | null;
  onConfirm: (values: any) => void;
};

const FormSolution = ({ values, form }: any) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ControlForm form={form} item={values.title} showMessage={false} />
        <ControlForm form={form} item={values.solutionType} showMessage={false} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ControlForm form={form} item={values.requiredTier} showMessage={false} />
      </div>
      <ControlForm form={form} item={values.content} showMessage={false} />
    </div>
  );
};

export const DialogLocalSolutionForm = ({
  open,
  onOpenChange,
  solution,
  onConfirm,
}: DialogLocalSolutionFormProps) => {
  const { t } = useAppTranslation();
  const { data: tierData, isLoading: isLoadingTier } = useListTier();

  const tierOptions =
    tierData?.data?.map((tier: any) => ({
      label: tier.name,
      value: tier.slug,
    })) || [];

  const formSchema = {
    title: z.string().min(
      1,
      t(($) => $.labels.required),
    ),
    content: z
      .array(z.record(z.string(), z.unknown()))
      .min(
        1,
        t(($) => $.labels.required),
      )
      .refine((val) => blocknote_to_text(val).trim().length > 0, {
        message: t(($) => $.labels.required),
      }),
    solutionType: z
      .enum(Object.values(EnumSolutionType) as [string, ...string[]])
      .default(EnumSolutionType.GENERAL),
    requiredTier: z.string().default("free"),
  };

  const formConfig = {
    title: {
      type: "text",
      name: "title",
      label: t(($) => $.exam.solutions.form.title.label),
      placeholder: t(($) => $.exam.solutions.form.title.placeholder),
      required: true,
    },
    solutionType: {
      type: "select",
      name: "solutionType",
      label: t(($) => $.exam.solutions.form.type.label),
      placeholder: t(($) => $.exam.solutions.form.type.placeholder),
      options: [
        {
          label: t(($) => $.exam.solutions.form.type.options.general),
          value: EnumSolutionType.GENERAL,
        },
        {
          label: t(($) => $.exam.solutions.form.type.options.fast_method),
          value: EnumSolutionType.FAST_METHOD,
        },
        {
          label: t(($) => $.exam.solutions.form.type.options.video_link),
          value: EnumSolutionType.VIDEO_LINK,
        },
        { label: t(($) => $.exam.solutions.form.type.options.tips), value: EnumSolutionType.TIPS },
      ],
    },
    requiredTier: {
      type: "select",
      name: "requiredTier",
      label: t(($) => $.exam.solutions.form.requiredTier.label),
      placeholder: t(($) => $.exam.solutions.form.requiredTier.placeholder),
      options: tierOptions,
      disabled: isLoadingTier,
    },
    content: {
      type: "blocknote",
      name: "content",
      label: t(($) => $.exam.solutions.form.content.label),
      placeholder: t(($) => $.exam.solutions.form.content.placeholder),
      wrapperClassName: "min-h-[400px]",
      required: true,
    },
  };

  const modalProps: ModalFormProps = {
    title: solution
      ? t(($) => $.exam.solutions.dialog.editTitle)
      : t(($) => $.exam.solutions.dialog.addTitle),
    desc: solution
      ? t(($) => $.exam.solutions.dialog.editDescription)
      : t(($) => $.exam.solutions.dialog.createDescription),
    modal: true,
    textConfirm: t(($) => $.labels.save),
    textCancel: t(($) => $.labels.cancel),
    defaultValue: {
      title: solution?.title || "",
      content:
        solution?.content && solution.content.length > 0
          ? solution.content
          : [{ type: "paragraph", content: [] }],
      solutionType: solution?.solutionType || EnumSolutionType.GENERAL,
      requiredTier: solution?.requiredTier || "free",
    },
    child: formConfig,
    schema: formSchema,
    content: <FormSolution />,
    onCancelClick: () => onOpenChange(false),
    onConfirmClick: async (values: any) => {
      onConfirm(values);
      onOpenChange(false);
    },
  };

  if (!open) return null;

  return <DialogModalForm modal={modalProps} />;
};
