import React, { useEffect } from "react";
import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { ControlForm } from "@/components/custom/forms";
import { useCreateQuestionOption, useUpdateQuestionOption } from "@/api/exam-question-options";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

import { ExamQuestion } from "@/api/exam-questions";

import { blocknote_to_text, prepare_blocknote_submission } from "@/lib/blocknote-utils";

export type DialogQuestionOptionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  option?: NonNullable<ExamQuestion["options"]>[number] | null;
  nextOrder?: number;
};

const FormOption = ({ values, form }: any) => {
  const isCorrect = form.watch("isCorrect");
  const score = form.watch("score");

  useEffect(() => {
    if (isCorrect && Number(score) === 0) {
      form.setValue("score", 1);
    }
  }, [isCorrect, score, form]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <ControlForm form={form} item={values.content} showMessage={false} />
      <ControlForm form={form} item={values.isCorrect} showMessage={false} />
      <ControlForm form={form} item={values.score} showMessage={false} />
    </div>
  );
};

export const DialogQuestionOptionForm = ({
  open,
  onOpenChange,
  questionId,
  option,
  nextOrder,
}: DialogQuestionOptionFormProps) => {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const createMutation = useCreateQuestionOption();
  const updateMutation = useUpdateQuestionOption(option?.id || "");
  const pendingFiles = React.useRef<Map<string, File>>(new Map());

  const uploadFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    pendingFiles.current.set(url, file);
    return url;
  };

  const formSchema = {
    content: z
      .array(z.record(z.string(), z.unknown()))
      .min(
        1,
        t(($) => $.exam.options.form.content.required),
      )
      .refine((val) => blocknote_to_text(val, { includeMath: true }).trim().length > 0, {
        message: t(($) => $.labels.required),
      }),
    isCorrect: z.boolean().default(false),
    score: z
      .number()
      .min(
        0,
        t(($) => $.exam.options.form.score.required),
      )
      .default(0),
  };

  const formConfig = {
    content: {
      type: "blocknote",
      name: "content",
      label: t(($) => $.exam.options.form.content.label),
      placeholder: t(($) => $.exam.options.form.content.placeholder),
      wrapperClassName: "min-h-[300px]",
      required: true,
      uploadFile,
    },
    isCorrect: {
      type: "switch",
      name: "isCorrect",
      label: t(($) => $.exam.options.form.isCorrect.label),
      description: t(($) => $.exam.options.form.isCorrect.description),
    },
    score: {
      type: "number",
      name: "score",
      label: t(($) => $.exam.options.form.score.label),
      placeholder: t(($) => $.exam.options.form.score.placeholder),
      required: true,
    },
  };

  const modalProps: ModalFormProps = {
    title: option
      ? t(($) => $.exam.options.dialog.editTitle)
      : t(($) => $.exam.options.dialog.addTitle),
    desc: option
      ? t(($) => $.exam.options.dialog.editDescription)
      : t(($) => $.exam.options.dialog.addDescription),
    modal: true,
    textConfirm:
      createMutation.isPending || updateMutation.isPending
        ? t(($) => $.labels.saving)
        : t(($) => $.labels.save),
    textCancel: t(($) => $.labels.cancel),
    defaultValue: {
      content:
        option?.content && option.content.length > 0
          ? option.content
          : [{ type: "paragraph", content: [] }],
      isCorrect: option?.isCorrect ?? false,
      score: option?.score ?? 0,
    },
    child: formConfig,
    schema: formSchema,
    content: <FormOption />,
    onCancelClick: () => onOpenChange(false),
    onConfirmClick: async (values: any) => {
      const formData = new FormData();

      // 1. Prepare content for submission
      const { submissionContent, filesToUpload } = prepare_blocknote_submission(
        values.content,
        pendingFiles.current,
        { prefix: "option" },
      );

      // 2. Add files
      filesToUpload.forEach(({ placeholder, file }) => {
        formData.append("files", file, placeholder);
      });

      // 3. Add data
      const commonData = {
        ...values,
        content: submissionContent,
      };

      if (option) {
        // UPDATE
        formData.append(
          "data",
          JSON.stringify({
            ...commonData,
          }),
        );
        await updateMutation.mutateAsync(formData, {
          onSuccess: (res) => {
            showNotifSuccess({
              message: res.message || t(($) => $.exam.options.notifications.updateSuccess),
            });
            queryClient.invalidateQueries({ queryKey: ["admin-exam-question-detail"] });
            onOpenChange(false);
          },
          onError: (err: any) => {
            showNotifError({ message: err.message || t(($) => $.labels.error) });
          },
        });
      } else {
        // CREATE
        formData.append(
          "data",
          JSON.stringify({
            questionId,
            ...commonData,
            order: nextOrder || 1,
          }),
        );
        await createMutation.mutateAsync(formData, {
          onSuccess: (res) => {
            showNotifSuccess({
              message: res.message || t(($) => $.exam.options.notifications.createSuccess),
            });
            queryClient.invalidateQueries({ queryKey: ["admin-exam-question-detail"] });
            onOpenChange(false);
          },
          onError: (err: any) => {
            showNotifError({ message: err.message || t(($) => $.labels.error) });
          },
        });
      }
    },
  };

  if (!open) return null;

  return <DialogModalForm modal={modalProps} />;
};
